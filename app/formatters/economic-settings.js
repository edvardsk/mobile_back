// constants
const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.ECONOMIC_SETTINGS.COLUMNS;

const formatDefaultEconomicSettingsForResponse = data => ({
    id: data.id,
    [cols.PERCENT_FROM_TRANSPORTER]: parseFloat(data[cols.PERCENT_FROM_TRANSPORTER]),
    [cols.PERCENT_FROM_HOLDER]: parseFloat(data[cols.PERCENT_FROM_HOLDER]),
    [cols.PERCENT_TO_FORWARDER]: parseFloat(data[cols.PERCENT_TO_FORWARDER]),
});

const formatEconomicSettingsToSave = (companyId, data) => ({
    ...data,
    [cols.COMPANY_ID]: companyId,
});

module.exports = {
    formatDefaultEconomicSettingsForResponse,
    formatEconomicSettingsToSave,
};
