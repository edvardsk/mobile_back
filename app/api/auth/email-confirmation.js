const { success, reject } = require('api/response');

// services
const UsersService = require('services/tables/users');
const EmailConfirmationService = require('services/tables/email-confirmation-hashes');
const RolesPermissionsService = require('services/tables/roles-to-permissions');

// constants
const { SQL_TABLES } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const { MAP_FROM_UNCONFIRMED_TO_CONFIRMED_EMAIL_ROLE, PERMISSIONS } = require('constants/system');
const { SUCCESS_CODES } = require('constants/http-codes');

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

        const upgradedRole = MAP_FROM_UNCONFIRMED_TO_CONFIRMED_EMAIL_ROLE[userRole];

        await EmailConfirmationService.confirmEmail(hashFromDb.id, userId, upgradedRole);

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    confirmEmail,
};
