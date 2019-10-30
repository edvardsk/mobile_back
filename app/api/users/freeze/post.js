const { success, reject } = require('api/response');

// services
const UsersService = require('services/tables/users');
const FreezingHistoryService = require('services/tables/freezing-history');

// constants
const { ERROR_CODES } = require('constants/http-codes');
const { ERRORS } = require('constants/errors');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const {
    MAP_ROLES_TO_FREEZING_PERMISSIONS,
} = require('constants/system');

// formatters
const { formatRecordToSave } = require('formatters/freezing-history');

const freezeUser = async (req, res, next) => {
    const colsFreezingHistory = SQL_TABLES.FREEZING_HISTORY.COLUMNS;
    try {
        const currentUserId = res.locals.user.id;
        const currentUserPermissions = res.locals.permissions;
        const { userId } = req.params;
        const user = await UsersService.getUserWithRoleAndFreezingData(userId);
        if (!user) {
            return reject(res, {}, {}, ERROR_CODES.FORBIDDEN);
        }

        if (user[colsFreezingHistory.FREEZED]) {
            return reject(res, ERRORS.FREEZING.FREEZED);
        }

        const permissionToFreeze = MAP_ROLES_TO_FREEZING_PERMISSIONS[user[HOMELESS_COLUMNS.ROLE]];
        if (!currentUserPermissions.has(permissionToFreeze)) {
            return reject(res, {}, {}, ERROR_CODES.FORBIDDEN);
        }

        const freezingData = formatRecordToSave(currentUserId, userId, true);
        await FreezingHistoryService.addRecord(freezingData);

        return success(res, {});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    freezeUser,
};
