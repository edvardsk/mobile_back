const { success, reject } = require('api/response');
const uuid = require('uuid/v4');

// services
const UsersService = require('services/tables/users');
const EmailConfirmationService = require('services/tables/email-confirmation-hashes');
const UsersRolesService = require('services/tables/users-to-roles');
const RolesService = require('services/tables/roles');
const PhoneNumbersService = require('services/tables/phone-numbers');
const PhonePrefixesService = require('services/tables/phone-prefixes');
const CountriesService = require('services/tables/countries');
const TableService = require('services/tables');
const CryptService = require('services/crypto');
const MailService = require('services/mail');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const { SUCCESS_CODES } = require('constants/http-codes');
const { MAP_ROLES_FROM_CLIENT_TO_SERVER, ROLES_TO_REGISTER } = require('constants/system');

// formatters
const { formatUserForSaving } = require('formatters/users');
const { formatRecordToSave } = require('formatters/email-confirmation');
const { formatRolesForResponse } = require('formatters/roles');
const { formatPhoneNumberToSave } = require('formatters/phone-numbers');
const { formatPhonePrefixesForResponse } = require('formatters/phone-prefixes');

const createUser = async (req, res, next) => {
    const colsUsers = SQL_TABLES.USERS.COLUMNS;
    const colsRoles = SQL_TABLES.ROLES.COLUMNS;
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

        await TableService.runTransaction([
            UsersService.addUserAsTransaction(data),
            UsersRolesService.addUserRoleAsTransaction(userId, pendingRole),
            EmailConfirmationService.addRecordAsTransaction(formatRecordToSave(userId, confirmationHash)),
            PhoneNumbersService.addRecordAsTransaction(formatPhoneNumberToSave(userId, phonePrefixId, phoneNumber)),
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

module.exports = {
    createUser,
    getRoles,
    getPhonePrefixes,
    getCountries,
};
