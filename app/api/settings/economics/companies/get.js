const { success } = require('api/response');

// services
const EconomicSettingsService = require('services/tables/economic-settings');

// formatters
const { formatEconomicSettingsForResponse } = require('formatters/economic-settings');

const getCompanyEconomicSettings = async (req, res, next) => {
    try {
        const { companyId } = req.params;
        const setting = await EconomicSettingsService.getRecordByCompanyId(companyId);
        return success(res, { setting: formatEconomicSettingsForResponse(setting) });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCompanyEconomicSettings,
};
