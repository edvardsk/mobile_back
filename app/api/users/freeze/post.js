const { success } = require('api/response');

const freezeUser = async (req, res, next) => {
    try {
        return success(res, {});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    freezeUser,
};
