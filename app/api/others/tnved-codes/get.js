const { success } = require('api/response');

// services
const TNVEDCodesService = require('services/tables/tnved-codes');

const getCodes = async (req, res, next) => {
    try {
        const codes = await TNVEDCodesService.getRecords();
        return success(res, { codes });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCodes,
};
