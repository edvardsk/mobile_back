const { success } = require('api/response');

// services
const EconomicSettingsService = require('services/tables/economic-settings');

// formatters
const { formatEconomicSettingsToSave } = require('formatters/economic-settings');

const editCompanyEconomicSettings = async (req, res, next) => {
    try {
        const { body } = req;
        const { companyId } = req.params;
        const settingsData = formatEconomicSettingsToSave(companyId, body);
        const record = await EconomicSettingsService.editRecordByCompanyId(companyId, settingsData);
        return success(res, { id: record.id });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    editCompanyEconomicSettings,
};
