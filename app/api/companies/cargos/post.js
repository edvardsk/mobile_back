const { success } = require('api/response');

// constants
const { SUCCESS_CODES } = require('constants/http-codes');

const createCargo = async (req, res, next) => {
    try {
        // const { isControlRole, company } = res.locals;
        //
        // const transactionList = [];

        return success(res, {}, SUCCESS_CODES.CREATED);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCargo,
};
