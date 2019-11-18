const { success } = require('api/response');

// services
const EconomicSettingsService = require('services/tables/economic-settings');

// constants
const { SUCCESS_CODES } = require('constants/http-codes');

const editDefaultEconomicSettings = async (req, res, next) => {
    try {
        const { body } = req;
        await EconomicSettingsService.editDefaultRecord(body);

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    editDefaultEconomicSettings,
};
