const { success } = require('api/response');

// services

const inviteManager = async (req, res, next) => {
    try {
        return success(res, {});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    inviteManager,
};
