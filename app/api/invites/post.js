const { success } = require('api/response');
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
const { SQL_TABLES } = require('constants/tables');
const { SUCCESS_CODES } = require('constants/http-codes');
const { ROLES } = require('constants/system');

// formatters
const { formatUserForSaving } = require('formatters/users');
const { formatRecordToSave } = require('formatters/email-confirmation');
const { formatPhoneNumberToSave } = require('formatters/phone-numbers');

const {
    INVITE_EXPIRATION_UNIT,
    INVITE_EXPIRATION_VALUE,
} = process.env;

const inviteManager = async (req, res, next) => {
    const colsUsers = SQL_TABLES.USERS.COLUMNS;
    try {
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
            EmailConfirmationService.addRecordAsTransaction(formatRecordToSave(userId, confirmationHash, inviteExpirationDate)),
            PhoneNumbersService.addRecordAsTransaction(formatPhoneNumberToSave(userId, phonePrefixId, phoneNumber)),
        ]);

        await MailService.sendConfirmationEmail(email, confirmationHash, ROLES.MANAGER);

        return success(res, {}, SUCCESS_CODES.CREATED);
    } catch (error) {
        next(error);
    }
};

const resendInvite = async (req, res, next) => {
    try {
        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    inviteManager,
    resendInvite,
};
