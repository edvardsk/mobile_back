const { success } = require('api/response');
const uuid = require('uuid/v4');
const moment = require('moment');

// services
const UsersService = require('services/tables/users');
const EmailConfirmationService = require('services/tables/email-confirmation-hashes');
const UsersRolesService = require('services/tables/users-to-roles');
const PhoneNumbersService = require('services/tables/phone-numbers');
const UsersCompaniesService = require('services/tables/users-to-companies');
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

const MAP_FROM_MAON_ROLE_TO_UNCOMFIRMED = {
    [ROLES.DISPATCHER]: ROLES.UNCONFIRMED_DISPATCHER,
    [ROLES.MANAGER]: ROLES.UNCONFIRMED_MANAGER,
};

const SET_ROLES_TO_APPLY_COMPANY = new Set([
    ROLES.UNCONFIRMED_DISPATCHER,
]);

const inviteUser = async (req, res, next) => {
    const colsUsers = SQL_TABLES.USERS.COLUMNS;
    const colsUsersCompanies = SQL_TABLES.USERS_TO_COMPANIES.COLUMNS;
    try {
        const currentUserId = res.locals.user.id;
        const { body } = req;
        const { role } = req.params;
        const unconfirmedRole = MAP_FROM_MAON_ROLE_TO_UNCOMFIRMED[role];
        const phoneNumber = body.phone_number;
        const phonePrefixId = body.phone_prefix_id;
        const email = body[colsUsers.EMAIL];

        const password = uuid();
        const { hash, key } = await CryptService.hashPassword(password);

        const userId = uuid();
        const confirmationHash = uuid();

        const data = formatUserForSaving(userId, body, hash, key);

        const inviteExpirationDate = moment().add(+INVITE_EXPIRATION_VALUE, INVITE_EXPIRATION_UNIT).toISOString();

        const transactionList = [
            UsersService.addUserAsTransaction(data),
            UsersRolesService.addUserRoleAsTransaction(userId, unconfirmedRole),
            EmailConfirmationService.addRecordAsTransaction(formatRecordToSave(userId, confirmationHash, currentUserId, inviteExpirationDate)),
            PhoneNumbersService.addRecordAsTransaction(formatPhoneNumberToSave(userId, phonePrefixId, phoneNumber)),
        ];

        if (SET_ROLES_TO_APPLY_COMPANY.has(unconfirmedRole)) {
            const userToCompany = await UsersCompaniesService.getRecordByUserIdStrict(currentUserId);
            transactionList.push(UsersCompaniesService.addRecordAsTransaction(formatRecordToSave(userId, userToCompany[colsUsersCompanies.COMPANY_ID])));
        }

        await TableService.runTransaction(transactionList);

        await MailService.sendConfirmationEmail(email, confirmationHash, role);

        return success(res, {}, SUCCESS_CODES.CREATED);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    inviteUser,
};
