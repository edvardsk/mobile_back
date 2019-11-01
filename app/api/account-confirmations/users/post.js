const { success, reject } = require('api/response');

// services
const PermissionsService = require('services/tables/permissions');
const UserPermissionsService = require('services/tables/users-to-permissions');
const TablesService = require('services/tables');

// constants
const { PERMISSIONS } = require('constants/system');
const { ERRORS } = require('constants/errors');

const confirmAccount = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const userPermissions = await PermissionsService.getAllUserPermissions(userId);

        if (!userPermissions.includes(PERMISSIONS.EXPECT_REGISTRATION_CONFIRMATION)) {
            return reject(res, ERRORS.ACCOUNT_CONFIRMATIONS.PROHIBITED);
        }

        const transactionsList = [
            UserPermissionsService.removeUserPermissionAsTransaction(userId, PERMISSIONS.EXPECT_REGISTRATION_CONFIRMATION),
        ];

        if (userPermissions.includes(PERMISSIONS.PASS_PRIMARY_CONFIRMATION)) {

            transactionsList.push(
                UserPermissionsService.removeUserPermissionAsTransaction(userId, PERMISSIONS.PASS_PRIMARY_CONFIRMATION),
            );
        }

        await TablesService.runTransaction(transactionsList);

        return success(res, {});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    confirmAccount,
};
