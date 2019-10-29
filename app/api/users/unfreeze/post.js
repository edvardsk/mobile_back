const { success } = require('api/response');

const unfreezeUser = async (req, res, next) => {
    try {
        return success(res, {});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    unfreezeUser,
};
