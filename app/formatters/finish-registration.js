const { SQL_TABLES } = require('constants/tables');

const colsCompanies = SQL_TABLES.COMPANIES.COLUMNS;

const formatCompanyForTransporterToSave = data => ({
    [colsCompanies.NAME]: data[colsCompanies.NAME],
    [colsCompanies.OWNERSHIP_TYPE]: data[colsCompanies.OWNERSHIP_TYPE],
    [colsCompanies.REGISTERED_AT]: data[colsCompanies.REGISTERED_AT],
    [colsCompanies.COUNTRY_ID]: data[colsCompanies.COUNTRY_ID],
    [colsCompanies.IDENTITY_NUMBER]: data[colsCompanies.IDENTITY_NUMBER],
    [colsCompanies.WEBSITE]: data[colsCompanies.WEBSITE] || null,
});

const formatCompanyForHolderToSave = data => ({
    [colsCompanies.NAME]: data[colsCompanies.NAME],
    [colsCompanies.OWNERSHIP_TYPE]: data[colsCompanies.OWNERSHIP_TYPE],
    [colsCompanies.REGISTERED_AT]: data[colsCompanies.REGISTERED_AT],
    [colsCompanies.COUNTRY_ID]: data[colsCompanies.COUNTRY_ID],
    [colsCompanies.IDENTITY_NUMBER]: data[colsCompanies.IDENTITY_NUMBER],
    [colsCompanies.WEBSITE]: data[colsCompanies.WEBSITE] || null,
});

const formatCompanyForForwarderToSave = data => ({
    [colsCompanies.COUNTRY_ID]: data[colsCompanies.COUNTRY_ID],
    [colsCompanies.IDENTITY_NUMBER]: data[colsCompanies.IDENTITY_NUMBER],
    [colsCompanies.WEBSITE]: data[colsCompanies.WEBSITE] || null,
    [colsCompanies.NAME]: data[colsCompanies.NAME] || null,
    [colsCompanies.REGISTERED_AT]: data[colsCompanies.REGISTERED_AT] || null,

});

module.exports = {
    formatCompanyForTransporterToSave,
    formatCompanyForHolderToSave,
    formatCompanyForForwarderToSave,
};
