const { success } = require('api/response');

// formatters
const { formatUserForResponse } = require('formatters/users');

const getUser = async (req, res, next) => {
    try {
        const { user } = res.locals;
        return success(res, { user: formatUserForResponse(user) });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUser,
};
