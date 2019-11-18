// constants
const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.ECONOMIC_SETTINGS.COLUMNS;

const formatEconomicSettingsForResponse = data => ({
    id: data.id,
    [cols.PERCENT_FROM_TRANSPORTER]: parseFloat(data[cols.PERCENT_FROM_TRANSPORTER]),
    [cols.PERCENT_FROM_HOLDER]: parseFloat(data[cols.PERCENT_FROM_HOLDER]),
    [cols.PERCENT_TO_FORWARDER]: parseFloat(data[cols.PERCENT_TO_FORWARDER]),
    [cols.CREATED_AT]: data[cols.CREATED_AT],
});

const formatEconomicSettingsToSave = (companyId, data) => ({
    ...data,
    [cols.COMPANY_ID]: companyId,
});

module.exports = {
    formatEconomicSettingsForResponse,
    formatEconomicSettingsToSave,
};
