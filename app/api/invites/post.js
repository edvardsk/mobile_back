const { success, reject } = require('api/response');
const uuid = require('uuid/v4');
const moment = require('moment');

// services
const UsersService = require('services/tables/users');
const EmailConfirmationService = require('services/tables/email-confirmation-hashes');
const UsersRolesService = require('services/tables/users-to-roles');
const PhoneNumbersService = require('services/tables/phone-numbers');
const TableService = require('services/tables');
const CryptService = require('services/crypto');
const MailService = require('services/mail');

// constants
const { ERRORS } = require('constants/errors');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { SUCCESS_CODES, ERROR_CODES } = require('constants/http-codes');
const { ROLES } = require('constants/system');

// formatters
const { formatUserForSaving } = require('formatters/users');
const { formatRecordToSave } = require('formatters/email-confirmation');
const { formatPhoneNumberToSave } = require('formatters/phone-numbers');
const { formatExpiredRecordToUpdate } = require('formatters/email-confirmation');

const {
    INVITE_EXPIRATION_UNIT,
    INVITE_EXPIRATION_VALUE,
} = process.env;

const MAP_ALLOWED_ROLES_TO_RESEND = {
    [ROLES.ADMIN]: new Set([
        ROLES.UNCONFIRMED_MANAGER,
        ROLES.CONFIRMED_EMAIL_MANAGER,
        ROLES.MANAGER,
    ]),
};

const inviteUser = async (req, res, next) => {
    const colsUsers = SQL_TABLES.USERS.COLUMNS;
    try {
        const currentUserId = res.locals.user.id;
        const { body } = req;
        const phoneNumber = body.phone_number;
        const phonePrefixId = body.phone_prefix_id;
        const email = body[colsUsers.EMAIL];

        const role = ROLES.UNCONFIRMED_MANAGER;

        const password = uuid();
        const { hash, key } = await CryptService.hashPassword(password);

        const userId = uuid();
        const confirmationHash = uuid();

        const data = formatUserForSaving(userId, body, hash, key);

        const inviteExpirationDate = moment().add(+INVITE_EXPIRATION_VALUE, INVITE_EXPIRATION_UNIT).toISOString();

        await TableService.runTransaction([
            UsersService.addUserAsTransaction(data),
            UsersRolesService.addUserRoleAsTransaction(userId, role),
            EmailConfirmationService.addRecordAsTransaction(formatRecordToSave(userId, confirmationHash, currentUserId, inviteExpirationDate)),
            PhoneNumbersService.addRecordAsTransaction(formatPhoneNumberToSave(userId, phonePrefixId, phoneNumber)),
        ]);

        await MailService.sendConfirmationEmail(email, confirmationHash, ROLES.MANAGER);

        return success(res, {}, SUCCESS_CODES.CREATED);
    } catch (error) {
        next(error);
    }
};

const resendInvite = async (req, res, next) => {
    const colsEmailConfirmationHashes = SQL_TABLES.EMAIL_CONFIRMATION_HASHES.COLUMNS;
    try {
        const currentUserId = res.locals.user.id;
        const currentUserRole = res.locals.user.role;
        const { email } = req.body;

        const user = await UsersService.getUserByEmailWithRole(email);

        const allowedRolesObject = MAP_ALLOWED_ROLES_TO_RESEND[currentUserRole];
        if (!allowedRolesObject.has(user[HOMELESS_COLUMNS.ROLE])) {
            return reject(res, {}, {}, ERROR_CODES.FORBIDDEN);
        }

        const latestHash = await EmailConfirmationService.getLatestHashByUserEmailStrict(email);

        if (latestHash[colsEmailConfirmationHashes.USED]) {
            return reject(res, ERRORS.INVITES.ALREADY_CONFIRMED);
        }

        const nextTryTime = moment(latestHash[colsEmailConfirmationHashes.CREATED_AT]).add(1, 'hours');
        if (moment(nextTryTime) > moment() && currentUserRole !== ROLES.ADMIN) {
            return reject(res, ERRORS.INVITES.TOO_OFTEN, { nextTryTime: nextTryTime.toISOString() });
        }

        const confirmationHash = uuid();
        const inviteExpirationDate = moment().add(+INVITE_EXPIRATION_VALUE, INVITE_EXPIRATION_UNIT).toISOString();
        const hashRecordToUpdate = formatExpiredRecordToUpdate();

        await TableService.runTransaction([
            EmailConfirmationService.updateRecordAsTransaction(latestHash.id, hashRecordToUpdate),
            EmailConfirmationService.addRecordAsTransaction(formatRecordToSave(user.id, confirmationHash, currentUserId, inviteExpirationDate)),
        ]);

        const MAP_UNCONFIRMED_TO_BASIC_ROLES = {
            [ROLES.UNCONFIRMED_MANAGER]: ROLES.MANAGER,
        };

        const senderRole = MAP_UNCONFIRMED_TO_BASIC_ROLES[user[HOMELESS_COLUMNS.ROLE]];

        await MailService.sendConfirmationEmail(email, confirmationHash, senderRole);

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    inviteUser,
    resendInvite,
};
