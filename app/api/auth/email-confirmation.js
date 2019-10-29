const { success, reject } = require('api/response');

// services
const UsersService = require('services/tables/users');
const EmailConfirmationService = require('services/tables/email-confirmation-hashes');
const RolesPermissionsService = require('services/tables/roles-to-permissions');
const UsersRolesService = require('services/tables/users-to-roles');
const TablesService = require('services/tables');
const CryptService = require('services/crypto');

// constants
const { SQL_TABLES } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const {
    PERMISSIONS,
    MAP_FROM_UNCONFIRMED_TO_CONFIRMED_EMAIL_ROLE,
    SET_ALLOWED_ROLES_FOR_EMAIL_CONFIRMATION,
    SET_ALLOWED_ROLES_FOR_ADVANCED_EMAIL_CONFIRMATION,
} = require('constants/system');
const { SUCCESS_CODES, ERROR_CODES } = require('constants/http-codes');

// formatters
const { formatUsedRecordToUpdate } = require('formatters/email-confirmation');
const { formatPasswordDataToUpdate } = require('formatters/users');

const confirmEmail = async (req, res, next) => {
    const colsEmailConfirmation = SQL_TABLES.EMAIL_CONFIRMATION_HASHES.COLUMNS;
    try {
        const { hash } = req.query;

        const hashFromDb = await EmailConfirmationService.getRecordByHash(hash);
        if (!hashFromDb) {
            return reject(res, ERRORS.AUTHORIZATION.INVALID_HASH);
        }

        const userId = hashFromDb[colsEmailConfirmation.USER_ID];

        const permissions = await RolesPermissionsService.getUserPermissions(userId);

        if (!permissions.includes(PERMISSIONS.CONFIRM_EMAIL)) {
            return reject(res, ERRORS.AUTHORIZATION.USER_CONFIRMED_EMAIL);
        }

        const userRole = await UsersService.getUserRole(userId);

        if (!SET_ALLOWED_ROLES_FOR_EMAIL_CONFIRMATION.has(userRole)) {
            return reject(res, {}, {}, ERROR_CODES.FORBIDDEN);
        }

        const upgradedRole = MAP_FROM_UNCONFIRMED_TO_CONFIRMED_EMAIL_ROLE[userRole];

        const emailData = formatUsedRecordToUpdate();

        await TablesService.runTransaction([
            EmailConfirmationService.updateRecordAsTransaction(hashFromDb.id, emailData),
            UsersRolesService.updateUserRoleAsTransaction(userId, upgradedRole),
        ]);

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

const advancedConfirmEmail = async (req, res, next) => {
    const colsUsers = SQL_TABLES.USERS.COLUMNS;
    const colsEmailConfirmation = SQL_TABLES.EMAIL_CONFIRMATION_HASHES.COLUMNS;
    try {
        const { body } = req;
        const { hash } = req.query;

        const hashFromDb = await EmailConfirmationService.getRecordByHash(hash);
        if (!hashFromDb) {
            return reject(res, ERRORS.AUTHORIZATION.INVALID_HASH);
        }

        const userId = hashFromDb[colsEmailConfirmation.USER_ID];

        const [userRole, permissions] = await Promise.all([
            UsersService.getUserRole(userId),
            RolesPermissionsService.getUserPermissions(userId),
        ]);

        if (!SET_ALLOWED_ROLES_FOR_ADVANCED_EMAIL_CONFIRMATION.has(userRole)) {
            return reject(res, {}, {}, ERROR_CODES.FORBIDDEN);
        }

        if (new Date(hashFromDb[colsEmailConfirmation.EXPIRED_AT]) < new Date()) {
            return reject(res, ERRORS.AUTHORIZATION.EXPIRED_HASH);
        }

        if (hashFromDb[colsEmailConfirmation.USED] || !permissions.includes(PERMISSIONS.CONFIRM_EMAIL)) {
            return reject(res, ERRORS.AUTHORIZATION.USER_CONFIRMED_EMAIL);
        }

        const upgradedRole = MAP_FROM_UNCONFIRMED_TO_CONFIRMED_EMAIL_ROLE[userRole];

        const emailData = formatUsedRecordToUpdate();

        const password = body[colsUsers.PASSWORD];
        const passwordObject = await CryptService.hashPassword(password);
        const passwordData = formatPasswordDataToUpdate(passwordObject);

        const transactionList = [
            UsersService.updateUserAsTransaction(userId, passwordData),
            EmailConfirmationService.updateRecordAsTransaction(hashFromDb.id, emailData),
            UsersRolesService.updateUserRoleAsTransaction(userId, upgradedRole),
        ];

        await TablesService.runTransaction(transactionList);

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    confirmEmail,
    advancedConfirmEmail,
};
