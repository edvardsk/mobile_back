// constants
const { SQL_TABLES } = require('constants/tables');

const colsEconomicSettings = SQL_TABLES.ECONOMIC_SETTINGS.COLUMNS;

const requiredNotExistingCompanyEconomicSettingsWithIdAsync = {
    $async: true,
    properties: {
        companyId: {
            company_economic_settings_with_id_exist: {},
        },
    },
};

const requiredExistingCompanyEconomicSettingsWithIdAsync = {
    $async: true,
    properties: {
        companyId: {
            company_economic_settings_with_id_not_exist: {},
        },
    },
};

const createCompanyEconomicSettingsParamsAsync = {
    $async: true,
    properties: {
        companyId: {
            company_economic_settings_exists: {},
        },
    },
    additionalProperties: true,
};

const requireExistingCompanyEconomicSettingsParamsAsync = {
    $async: true,
    properties: {
        companyId: {
            company_economic_settings_not_exists: {},
        },
    },
    additionalProperties: true,
};

const createOrEditEconomicSettings = {
    properties: {
        [colsEconomicSettings.PERCENT_FROM_TRANSPORTER]: {
            type: 'number',
            minimum: 0,
            exclusiveMaximum: 100,
        },
        [colsEconomicSettings.PERCENT_TO_FORWARDER]: {
            type: 'number',
            minimum: 0,
            exclusiveMaximum: 100,
        },
        [colsEconomicSettings.PERCENT_FROM_HOLDER]: {
            type: 'number',
            minimum: 0,
            maximum: 100,
        },
    },
    required: [
        colsEconomicSettings.PERCENT_FROM_TRANSPORTER,
        colsEconomicSettings.PERCENT_TO_FORWARDER,
        colsEconomicSettings.PERCENT_FROM_HOLDER,
    ],
    additionalProperties: true,
};

module.exports = {
    requiredNotExistingCompanyEconomicSettingsWithIdAsync,
    requiredExistingCompanyEconomicSettingsWithIdAsync,
    createOrEditEconomicSettings,
    createCompanyEconomicSettingsParamsAsync,
    requireExistingCompanyEconomicSettingsParamsAsync,
};
