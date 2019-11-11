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
    MAP_ROLES_PRIORITY_TO_UNFREEZE,
} = require('constants/system');

// formatters
const { formatRecordToSave } = require('formatters/freezing-history');
const { formatFreezingFieldToEdit } = require('formatters/users');

const unfreezeUser = async (req, res, next) => {
    const colsFreezingHistory = SQL_TABLES.FREEZING_HISTORY.COLUMNS;
    const colsUsers = SQL_TABLES.USERS.COLUMNS;
    try {
        const currentUserId = res.locals.user.id;
        const currentUserRole = res.locals.user.role;
        const currentUserPermissions = res.locals.permissions;
        const isControlRole = res.locals.user.isControlRole;
        const { userId } = req.params;
        const user = await UsersService.getUserWithRoleAndFreezingData(userId);
        if (!user) {
            return reject(res, {}, {}, ERROR_CODES.FORBIDDEN);
        }

        if (!isControlRole) {
            const isFromOneCompany = await UsersCompaniesService.isUsersFromOneCompany(currentUserId, user.id);
            if (!isFromOneCompany) {
                return reject(res, {}, {}, ERROR_CODES.FORBIDDEN);
            }
        }

        if (!user[colsUsers.FREEZED]) {
            return reject(res, ERRORS.FREEZING.NOT_FREEZED);
        }

        const permissionToFreeze = MAP_ROLES_TO_FREEZING_PERMISSIONS[user[HOMELESS_COLUMNS.ROLE]];
        if (!currentUserPermissions.has(permissionToFreeze)) {
            return reject(res, {}, {}, ERROR_CODES.FORBIDDEN);
        }

        const initiatorFreezing = await UsersService.getUserRole(user[colsFreezingHistory.INITIATOR_ID]);

        const initiatorPower = MAP_ROLES_PRIORITY_TO_UNFREEZE[initiatorFreezing];
        const unfreezerPower = MAP_ROLES_PRIORITY_TO_UNFREEZE[currentUserRole];

        if (initiatorPower > unfreezerPower) {
            return reject(res, ERRORS.FREEZING.NOT_ENOUGH_POWER, {}, ERROR_CODES.FORBIDDEN);
        }

        const unfreezingData = formatRecordToSave(currentUserId, userId, false);

        const userData = formatFreezingFieldToEdit(false);

        const transactionsList = [
            FreezingHistoryService.addRecordAsTransaction(unfreezingData),
            UsersService.updateUserAsTransaction(userId, userData),
        ];

        await TablesService.runTransaction(transactionsList);

        return success(res, {});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    unfreezeUser,
};
