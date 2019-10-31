const { success, reject } = require('api/response');

// services
const UsersService = require('services/tables/users');
const PermissionsService = require('services/tables/permissions');
const UserRolesService = require('services/tables/users-to-roles');
const UserPermissionsService = require('services/tables/users-to-permissions');
const TablesService = require('services/tables');

// constants
const { PERMISSIONS, MAP_FROM_PENDING_ROLE_TO_MAIN } = require('constants/system');
const { ERRORS } = require('constants/errors');
const { HOMELESS_COLUMNS } = require('constants/tables');

const confirmAccount = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const userPermissions = await PermissionsService.getAllUserPermissions(userId);

        if (!userPermissions.includes(PERMISSIONS.EXPECT_REGISTRATION_CONFIRMATION)) {
            return reject(res, ERRORS.ACCOUNT_CONFIRMATIONS.PROHIBITED);
        }

        // const transactionsList = [
        //     UserPermissionsService.removeUserPermissionAsTransaction(userId, PERMISSIONS.EXPECT_REGISTRATION_CONFIRMATION),
        // ];
        //
        // if (userPermissions.includes(PERMISSIONS.FINISH_REGISTRATION)) {
        //     const userWithRole = await UsersService.getUserWithRole(userId);
        //     const userRole = userWithRole[HOMELESS_COLUMNS.ROLE];
        //     const nextUserRole = MAP_FROM_PENDING_ROLE_TO_MAIN[userRole];
        //
        //     if (!nextUserRole) {
        //         return reject(res, ERRORS.SYSTEM.ERROR);
        //     }
        //     transactionsList.push(
        //         UserRolesService.updateUserRoleAsTransaction(userId, nextUserRole)
        //     );
        // }

        // await TablesService.runTransaction(transactionsList);

        return success(res, {});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    confirmAccount,
};
