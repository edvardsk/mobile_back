const { success } = require('api/response');
const uuid = require('uuid/v4');
const moment = require('moment');

// services
const UsersService = require('services/tables/users');
const CompaniesService = require('services/tables/companies');
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
    MAP_ROLES_TO_ROLES_TO_INVITE,
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
    try {
        const currentUserId = res.locals.user.id;
        const { isControlRole } = res.locals.user;
        const { shadowUserId } = res.locals;
        const { role } = req.params;

        let companyHeadId;
        if (isControlRole) {
            companyHeadId = shadowUserId;
        } else {
            companyHeadId = currentUserId;
        }

        const company = await CompaniesService.getCompanyByUserId(companyHeadId);
        if (!company) {
            return reject(res, ERRORS.COMPANIES.INVALID_COMPANY_ID);
        }

        const invitedUserId = uuid();
        const userCompanyData = UsersCompaniesFormatters.formatRecordToSave(invitedUserId, company.id);

        const transactionsListHead = [];
        const transactionsListTail = [];

        // transactionsListTail.push(
        //     UsersCompaniesService.addRecordAsTransaction(userCompanyData)
        // );

        const inviteData = {
            invitedUserId,
            invitedUserRole: role,
            transactionsListHead,
            transactionsListTail,
        };

        res.locals.inviteData = inviteData;

        return next();
    } catch (error) {
        next(error);
    }
};

const inviteUserAdvanced = async (req, res, next) => {
    try {
        const { inviteData } = res.locals;
        const { transactionsListHead, transactionsListTail, invitedUserId } = inviteData;


        return next();
    } catch (error) {
        next(error);
    }
};

const inviteUserWithoutCompany = async (req, res, next) => {
    try {
        const invitedUserId = uuid();
        const inviteData = {
            invitedUserId,
            transactionsListHead: [],
            transactionsListTail: [],
        };
        res.locals.inviteData = inviteData;
        return next();
    } catch (error) {
        next(error);
    }
};

const inviteMiddleware = async (req, res, next) => {
    const colsUsers = SQL_TABLES.USERS.COLUMNS;
    try {
        const { inviteData } = res.locals;
        const { transactionsListHead, transactionsListTail, invitedUserId } = inviteData;

        const currentUserId = res.locals.user.id;
        const { body } = req;
        const { role } = req.params;
        const unconfirmedRole = MAP_FROM_MAIN_ROLE_TO_UNCONFIRMED[role];
        const phoneNumber = body.phone_number;
        const phonePrefixId = body.phone_prefix_id;
        const email = body[colsUsers.EMAIL];

        const password = uuid();
        const { hash, key } = await CryptService.hashPassword(password);

        const userId = invitedUserId;
        const confirmationHash = uuid();

        const data = UsersFormatters.formatUserForSaving(userId, body, hash, key);

        const inviteExpirationDate = moment().add(+INVITE_EXPIRATION_VALUE, INVITE_EXPIRATION_UNIT).toISOString();
        const emailConfirmationData = EmailConfirmationFormatters.formatRecordToSave(userId, confirmationHash, currentUserId, inviteExpirationDate);
        const phoneNumberData = PhoneNumbersFormatters.formatPhoneNumberToSave(userId, phonePrefixId, phoneNumber);

        // const transactionList = [
        //     UsersService.addUserAsTransaction(data),
        //     UsersRolesService.addUserRoleAsTransaction(userId, unconfirmedRole),
        //     EmailConfirmationService.addRecordAsTransaction(emailConfirmationData),
        //     PhoneNumbersService.addRecordAsTransaction(phoneNumberData),
        // ];


        // await TableService.runTransaction([
        //     ...transactionListHead,
        //     ...transactionList,
        //     ...transactionListTail,
        // ]);

        await MailService.sendConfirmationEmail(email, confirmationHash, role);
        return success(res, {}, SUCCESS_CODES.CREATED);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    inviteUser,
    inviteUserAdvanced,
    inviteUserWithoutCompany,
    inviteMiddleware,
};
