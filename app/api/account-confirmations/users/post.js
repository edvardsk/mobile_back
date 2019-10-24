const { success } = require('api/response');

const confirmAccount = async (req, res, next) => {
    try {
        return success(res, {});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    confirmAccount,
};
