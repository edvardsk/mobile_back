const { success } = require('api/response');

// formatters
const { formatUserWithPermissionsForResponse } = require('formatters/users');

const getUser = async (req, res, next) => {
    try {
        const { user, permissions } = res.locals;
        return success(res, { user: formatUserWithPermissionsForResponse(user, permissions) });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUser,
};
