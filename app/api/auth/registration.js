const { success, reject } = require('api/response');
const uuid = require('uuid/v4');

// services
const UsersService = require('services/tables/users');
const CompaniesService = require('services/tables/companies');
const EmailConfirmationService = require('services/tables/email-confirmation-hashes');
const UsersCompaniesService = require('services/tables/users-to-companies');
const UsersRolesService = require('services/tables/users-to-roles');
const RolesService = require('services/tables/roles');
const PhoneNumbersService = require('services/tables/phone-numbers');
const PhonePrefixesService = require('services/tables/phone-prefixes');
const CountriesService = require('services/tables/countries');
const LanguagesService = require('services/tables/languages');
const TableService = require('services/tables');
const CryptService = require('services/crypto');
const MailService = require('services/mail');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const { SUCCESS_CODES } = require('constants/http-codes');
const { MAP_ROLES_FROM_CLIENT_TO_SERVER, ROLES_TO_REGISTER } = require('constants/system');

// formatters
const UsersCompaniesFormatters = require('formatters/users-to-companies');
const { formatUserForSaving } = require('formatters/users');
const { formatRecordToSave } = require('formatters/email-confirmation');
const { formatRolesForResponse } = require('formatters/roles');
const { formatPhoneNumberToSave } = require('formatters/phone-numbers');
const { formatPhonePrefixesForResponse } = require('formatters/phone-prefixes');
const { formatLanguagesForResponse } = require('formatters/languages');

const createUser = async (req, res, next) => {
    const colsUsers = SQL_TABLES.USERS.COLUMNS;
    const colsRoles = SQL_TABLES.ROLES.COLUMNS;
    const colsCompanies = SQL_TABLES.COMPANIES.COLUMNS;
    try {
        const { body } = req;
        const phoneNumber = body.phone_number;
        const phonePrefixId = body.phone_prefix_id;
        const email = body[colsUsers.EMAIL];

        const userByEmail = await UsersService.getUserByEmail(email);
        if (userByEmail) {
            return reject(res, ERRORS.REGISTRATION.DUPLICATE_USER);
        }

        const roleId = body[HOMELESS_COLUMNS.ROLE_ID];
        const role = await RolesService.getRole(roleId);

        const pendingRole = MAP_ROLES_FROM_CLIENT_TO_SERVER[role[colsRoles.NAME]];

        if (!pendingRole) {
            return reject(res, ERRORS.REGISTRATION.INVALID_ROLE_ID);
        }

        const password = body[colsUsers.PASSWORD];
        const { hash, key } = await CryptService.hashPassword(password);

        const userId = uuid();
        const confirmationHash = uuid();

        const data = formatUserForSaving(userId, body, hash, key);

        const companyId = uuid();
        const companyData = {
            id: companyId,
            [colsCompanies.HEAD_ROLE_ID]: roleId,
        };
        const userCompanyData = UsersCompaniesFormatters.formatRecordToSave(userId, companyId);

        await TableService.runTransaction([
            UsersService.addUserAsTransaction(data),
            UsersRolesService.addUserRoleAsTransaction(userId, pendingRole),
            EmailConfirmationService.addRecordAsTransaction(formatRecordToSave(userId, confirmationHash)),
            PhoneNumbersService.addRecordAsTransaction(formatPhoneNumberToSave(userId, phonePrefixId, phoneNumber)),
            CompaniesService.addCompanyAsTransaction(companyData),
            UsersCompaniesService.addRecordAsTransaction(userCompanyData),
        ]);

        await MailService.sendConfirmationEmail(email, confirmationHash, role[colsRoles.NAME]);

        return success(res, {}, SUCCESS_CODES.CREATED);
    } catch (error) {
        next(error);
    }
};

const getRoles = async (req, res, next) => {
    try {
        const roles = await RolesService.getRolesByNames(ROLES_TO_REGISTER);
        return success(res, { roles: formatRolesForResponse(roles) });
    } catch (error) {
        next(error);
    }
};

const getPhonePrefixes = async (req, res, next) => {
    try {
        const prefixes = await PhonePrefixesService.getRecords();
        return success(res, { prefixes: formatPhonePrefixesForResponse(prefixes) });
    } catch (error) {
        next(error);
    }
};

const getCountries = async (req, res, next) => {
    try {
        const countries = await CountriesService.getCountries();
        return success(res, { countries });
    } catch (error) {
        next(error);
    }
};

const getLanguages = async (req, res, next) => {
    try {
        const languages = await LanguagesService.getLanguages();
        return success(res, { languages: formatLanguagesForResponse(languages) });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createUser,
    getRoles,
    getPhonePrefixes,
    getCountries,
    getLanguages,
};
