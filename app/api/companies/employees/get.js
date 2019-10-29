const { success } = require('api/response');

// services

// constants

// formatters

const getListEmployees = async (req, res, next) => {
    try {

        return success(res, {});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getListEmployees,
};
