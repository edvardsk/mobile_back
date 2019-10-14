const { success } = require('api/response');

// services

// constants

// formatters

// helpers

const sendCode = async (req, res, next) => {
    try {

        return success(res, {});
    } catch (error) {
        next(error);
    }
};

const confirmPhone = async (req, res, next) => {
    try {

        return success(res, {});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    sendCode,
    confirmPhone,
};
