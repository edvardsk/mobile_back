const { success } = require('api/response');

// services
const EconomicSettingsService = require('services/tables/economic-settings');

// formatters
const { formatEconomicSettingsForResponse } = require('formatters/economic-settings');

const getDefaultEconomicSettings = async (req, res, next) => {
    try {
        const setting = await EconomicSettingsService.getDefaultRecordStrict();
        return success(res, { setting: formatEconomicSettingsForResponse(setting) });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDefaultEconomicSettings,
};
