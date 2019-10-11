const { success, reject } = require('api/response');
const uuid = require('uuid/v4');

// services
const UsersService = require('services/tables/users');
const EmailConfirmationService = require('services/tables/email-confirmation-hashes');
const UsersRolesService = require('services/tables/users-to-roles');
const RolesService = require('services/tables/roles');
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

const createUser = async (req, res, next) => {
    const colsUsers = SQL_TABLES.USERS.COLUMNS;
    const colsRoles = SQL_TABLES.ROLES.COLUMNS;
    try {
        const { body } = req;

        const email = body[colsUsers.EMAIL];
        const userByEmail = await UsersService.getUserByEmail(email);
        if (userByEmail) {
            return reject(res, ERRORS.REGISTRATION.DUPLICATE_USER);
        }

        const roleId = body[HOMELESS_COLUMNS.ROLE_ID];
        const role  = await RolesService.getRole(roleId);

        if (!role) {
            return reject(res, ERRORS.REGISTRATION.INVALID_ROLE_ID);
        }

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
        ]);

        await MailService.sendConfirmationEmail(email, confirmationHash);

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

module.exports = {
    createUser,
    getRoles,
};
