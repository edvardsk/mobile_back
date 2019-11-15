const { success } = require('api/response');

// services
const EconomicSettingsService = require('services/tables/economic-settings');

const deleteCompanyEconomicSettings = async (req, res, next) => {
    try {
        const { companyId } = req.params;
        const setting = await EconomicSettingsService.removeRecordByCompanyId(companyId);
        return success(res, { id: setting.id });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    deleteCompanyEconomicSettings,
};
