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
const {
    MAP_FROM_MAIN_ROLE_TO_UNCONFIRMED,
    SET_ROLES_TO_APPLY_COMPANY_FOR_INVITE,
} = require('constants/system');

// formatters
const UsersFormatters = require('formatters/users');
const EmailConfirmationFormatters = require('formatters/email-confirmation');
const UsersCompaniesFormatters = require('formatters/users-to-companies');
const PhoneNumbersFormatters = require('formatters/phone-numbers');

const {
    INVITE_EXPIRATION_UNIT,
    INVITE_EXPIRATION_VALUE,
} = process.env;

const inviteUser = async (req, res, next) => {
    const colsUsers = SQL_TABLES.USERS.COLUMNS;
    const colsUsersCompanies = SQL_TABLES.USERS_TO_COMPANIES.COLUMNS;
    try {
        // const currentUserId = res.locals.user.id;
        // const { body } = req;
        // const { role } = req.params;
        // const unconfirmedRole = MAP_FROM_MAIN_ROLE_TO_UNCONFIRMED[role];
        // const phoneNumber = body.phone_number;
        // const phonePrefixId = body.phone_prefix_id;
        // const email = body[colsUsers.EMAIL];
        //
        // const password = uuid();
        // const { hash, key } = await CryptService.hashPassword(password);
        //
        // const userId = uuid();
        // const confirmationHash = uuid();
        //
        // const data = UsersFormatters.formatUserForSaving(userId, body, hash, key);
        //
        // const inviteExpirationDate = moment().add(+INVITE_EXPIRATION_VALUE, INVITE_EXPIRATION_UNIT).toISOString();
        // const emailConfirmationData = EmailConfirmationFormatters.formatRecordToSave(userId, confirmationHash, currentUserId, inviteExpirationDate);
        // const phoneNumberData = PhoneNumbersFormatters.formatPhoneNumberToSave(userId, phonePrefixId, phoneNumber);
        //
        // const transactionList = [
        //     UsersService.addUserAsTransaction(data),
        //     UsersRolesService.addUserRoleAsTransaction(userId, unconfirmedRole),
        //     EmailConfirmationService.addRecordAsTransaction(emailConfirmationData),
        //     PhoneNumbersService.addRecordAsTransaction(phoneNumberData),
        // ];
        //
        // if (SET_ROLES_TO_APPLY_COMPANY_FOR_INVITE.has(unconfirmedRole)) {
        //     const userToCompany = await UsersCompaniesService.getRecordByUserIdStrict(currentUserId);
        //     const userCompanyData = UsersCompaniesFormatters.formatRecordToSave(userId, userToCompany[colsUsersCompanies.COMPANY_ID]);
        //     transactionList.push(UsersCompaniesService.addRecordAsTransaction(userCompanyData));
        // }
        //
        // await TableService.runTransaction(transactionList);
        //
        // await MailService.sendConfirmationEmail(email, confirmationHash, role);

        console.log('basic');

        return success(res, {}, SUCCESS_CODES.CREATED);
    } catch (error) {
        next(error);
    }
};

const inviteUserAdvanced = async (req, res, next) => {
    try {
        console.log('advanced');
        return success(res, {}, SUCCESS_CODES.CREATED);
    } catch (error) {
        next(error);
    }
};

const inviteUserWithoutCompany = async (req, res, next) => {
    try {
        console.log('without company');
        return success(res, {}, SUCCESS_CODES.CREATED);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    inviteUser,
    inviteUserAdvanced,
    inviteUserWithoutCompany,
};
