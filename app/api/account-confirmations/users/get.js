const { success } = require('api/response');

// services
const UsersService = require('services/tables/users');

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
        return success(res, {});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getListUsers,
    getAllUserData,
};
