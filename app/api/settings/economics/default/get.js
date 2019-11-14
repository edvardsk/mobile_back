const { success } = require('api/response');

// services
const EconomicSettingsService = require('services/tables/economic-settings');

// formatters
const { formatDefaultEconomicSettingsForResponse } = require('formatters/economic-settings');

const getDefaultEconomicSettings = async (req, res, next) => {
    try {
        const setting = await EconomicSettingsService.getDefaultRecordStrict();
        return success(res, { setting: formatDefaultEconomicSettingsForResponse(setting) });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDefaultEconomicSettings,
};
