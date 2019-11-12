const { success, reject } = require('api/response');

// services
const UsersService = require('services/tables/users');
const FreezingHistoryService = require('services/tables/freezing-history');
const UsersCompaniesService = require('services/tables/users-to-companies');
const TablesService = require('services/tables');

// constants
const { ERROR_CODES } = require('constants/http-codes');
const { ERRORS } = require('constants/errors');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const {
    MAP_ROLES_TO_FREEZING_PERMISSIONS,
} = require('constants/system');

// formatters
const { formatRecordToSave } = require('formatters/freezing-history');
const { formatFreezingFieldToEdit } = require('formatters/users');

const freezeUser = async (req, res, next) => {
    const colsUsers = SQL_TABLES.USERS.COLUMNS;
    try {
        const currentUserId = res.locals.user.id;
        const currentUserPermissions = res.locals.permissions;
        const { isControlRole } = res.locals;

        const { userId } = req.params;
        const user = await UsersService.getUserWithRole(userId);
        if (!user) {
            return reject(res, {}, {}, ERROR_CODES.FORBIDDEN);
        }

        if (!isControlRole) {
            const isFromOneCompany = await UsersCompaniesService.isUsersFromOneCompany(currentUserId, user.id);
            if (!isFromOneCompany) {
                return reject(res, {}, {}, ERROR_CODES.FORBIDDEN);
            }
        }

        if (user[colsUsers.FREEZED]) {
            return reject(res, ERRORS.FREEZING.FREEZED);
        }

        const permissionToFreeze = MAP_ROLES_TO_FREEZING_PERMISSIONS[user[HOMELESS_COLUMNS.ROLE]];
        if (!currentUserPermissions.has(permissionToFreeze)) {
            return reject(res, {}, {}, ERROR_CODES.FORBIDDEN);
        }

        const freezingData = formatRecordToSave(currentUserId, userId, true);
        const userData = formatFreezingFieldToEdit(true);

        const transactionsList = [
            FreezingHistoryService.addRecordAsTransaction(freezingData),
            UsersService.updateUserAsTransaction(userId, userData),
        ];

        await TablesService.runTransaction(transactionsList);

        return success(res, { userId });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    freezeUser,
};
