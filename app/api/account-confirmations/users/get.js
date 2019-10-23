const { success } = require('api/response');

const getListUsers = async (req, res, next) => {
    try {
        return success(res, {});
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
