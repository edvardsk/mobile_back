const { get } = require('lodash');
const { success } = require('api/response');

// services
const EconomicSettingsService = require('services/tables/economic-settings');

// formatters
const { formatPaginationDataForResponse } = require('formatters/pagination-sorting');
const { formatEconomicSettingsForResponse } = require('formatters/economic-settings');

// constants
const { SQL_TABLES } = require('constants/tables');
const { SORTING_DIRECTIONS } = require('constants/pagination-sorting');

// helpers
const { getParams } = require('helpers/pagination-sorting');

const getCompanyEconomicSettings = async (req, res, next) => {
    try {
        const { companyId } = req.params;
        const setting = await EconomicSettingsService.getRecordByCompanyId(companyId);
        return success(res, { setting: formatEconomicSettingsForResponse(setting) });
    } catch (error) {
        next(error);
    }
};

const companiesEconomicSettingsPaginationOptions = {
    DEFAULT_LIMIT: 5,
    DEFAULT_SORT_COLUMN: SQL_TABLES.ECONOMIC_SETTINGS.COLUMNS.CREATED_AT,
    DEFAULT_SORT_DIRECTION: SORTING_DIRECTIONS.ASC,
};

const getCompaniesEconomicSettings = async (req, res, next) => {
    try {
        const {
            page,
            limit,
            sortColumn,
            asc,
        } = getParams(req, companiesEconomicSettingsPaginationOptions);

        const filter = get(req, 'query.filter', {});

        const [settings, settingsCount] = await Promise.all([
            EconomicSettingsService.getCompaniesEconomicSettingsPaginationSorting(limit, limit * page, sortColumn, asc, filter),
            EconomicSettingsService.getCountCompaniesEconomicSettings(filter)
        ]);

        const result = formatPaginationDataForResponse(
            settings.map(setting => formatEconomicSettingsForResponse(setting)),
            settingsCount,
            limit,
            page,
            sortColumn,
            asc,
            filter
        );

        return success(res, result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCompanyEconomicSettings,
    getCompaniesEconomicSettings,
};
