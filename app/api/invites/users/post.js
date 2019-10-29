const { success, reject } = require('api/response');
const uuid = require('uuid/v4');
const moment = require('moment');

// services
const UsersService = require('services/tables/users');
const EmailConfirmationService = require('services/tables/email-confirmation-hashes');
const UsersCompaniesService = require('services/tables/users-to-companies');
const TableService = require('services/tables');
const MailService = require('services/mail');

// constants
const { ERRORS } = require('constants/errors');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { SUCCESS_CODES, ERROR_CODES } = require('constants/http-codes');
const {
    ROLES,
    MAP_UNCONFIRMED_TO_BASIC_ROLES,
    MAP_ALLOWED_ROLES_TO_RESEND_EMAIL,

} = require('constants/system');

// formatters
const { formatRecordToSave } = require('formatters/email-confirmation');
const { formatExpiredRecordToUpdate } = require('formatters/email-confirmation');

const {
    INVITE_EXPIRATION_UNIT,
    INVITE_EXPIRATION_VALUE,
} = process.env;

const resendInvite = async (req, res, next) => {
    const colsUsers = SQL_TABLES.USERS.COLUMNS;
    const colsEmailConfirmationHashes = SQL_TABLES.EMAIL_CONFIRMATION_HASHES.COLUMNS;
    try {
        const currentUserId = res.locals.user.id;
        const currentUserRole = res.locals.user.role;
        const { userId } = req.params;

        const user = await UsersService.getUserWithRole(userId);

        const allowedRolesObject = MAP_ALLOWED_ROLES_TO_RESEND_EMAIL[currentUserRole];
        if (!allowedRolesObject || !allowedRolesObject.has(user[HOMELESS_COLUMNS.ROLE])) {
            return reject(res, {}, {}, ERROR_CODES.FORBIDDEN);
        }

        const isFromOneCompany = await UsersCompaniesService.isUsersFromOneCompany(currentUserId, user.id);
        if (!isFromOneCompany && currentUserRole !== ROLES.ADMIN && currentUserRole !== ROLES.MANAGER) {
            return reject(res, {}, {}, ERROR_CODES.FORBIDDEN);
        }

        const latestHash = await EmailConfirmationService.getLatestHashByUserIdlStrict(userId);

        if (latestHash[colsEmailConfirmationHashes.USED]) {
            return reject(res, ERRORS.INVITES.ALREADY_CONFIRMED);
        }

        // const nextTryTime = moment(latestHash[colsEmailConfirmationHashes.CREATED_AT]).add(1, 'hours'); // todo: uncomment
        // if (moment(nextTryTime) > moment() && currentUserRole !== ROLES.ADMIN) {
        //     return reject(res, ERRORS.INVITES.TOO_OFTEN, { nextTryTime: nextTryTime.toISOString() });
        // }

        const confirmationHash = uuid();
        const inviteExpirationDate = moment().add(+INVITE_EXPIRATION_VALUE, INVITE_EXPIRATION_UNIT).toISOString();
        const hashRecordToUpdate = formatExpiredRecordToUpdate();

        await TableService.runTransaction([
            EmailConfirmationService.updateRecordAsTransaction(latestHash.id, hashRecordToUpdate),
            EmailConfirmationService.addRecordAsTransaction(formatRecordToSave(user.id, confirmationHash, currentUserId, inviteExpirationDate)),
        ]);

        const receiverRole = MAP_UNCONFIRMED_TO_BASIC_ROLES[user[HOMELESS_COLUMNS.ROLE]];

        await MailService.sendConfirmationEmail(user[colsUsers.EMAIL], confirmationHash, receiverRole);

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    resendInvite,
};
