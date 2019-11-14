const { success } = require('api/response');

// services
const EconomicSettingsService = require('services/tables/economic-settings');

// formatters
const { formatEconomicSettingsToSave } = require('formatters/economic-settings');

// constants
const { SUCCESS_CODES } = require('constants/http-codes');

const createCompanyEconomicSettings = async (req, res, next) => {
    try {
        const { body } = req;
        const { companyId } = req.params;
        const settingsData = formatEconomicSettingsToSave(companyId, body);
        await EconomicSettingsService.createRecord(settingsData);
        return success(res, {}, SUCCESS_CODES.CREATED);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCompanyEconomicSettings,
};
