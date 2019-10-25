const { success } = require('api/response');

// services
const UsersService = require('services/tables/users');
const PermissionsService = require('services/tables/permissions');

// constants
const { PERMISSIONS } = require('constants/system');

const getListUsers = async (req, res, next) => {
    try {
        const users = await UsersService.getUsersWithRoleByPermission(PERMISSIONS.EXPECT_REGISTRATION_CONFIRMATION);

        return success(res, { users });
    } catch (error) {
        next(error);
    }
};

const getAllUserData = async (req, res, next) => {
    try {
        const { userId } = req.params;
        await Promise.all([
            UsersService.getUserWithRole(userId),
            PermissionsService.getAllUserPermissions(userId),
        ]);

        return success(res, {});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getListUsers,
    getAllUserData,
};
