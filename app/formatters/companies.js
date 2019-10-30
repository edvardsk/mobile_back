// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { Geo } = require('constants/instances');

const cols = SQL_TABLES.COMPANIES.COLUMNS;

const formatInitialDataToSave = (body, userId) => ({
    [cols.USER_ID]: userId,
    [cols.NAME]: body[cols.NAME],
});

const formatCompanyDataOnStep2 = data => ({
    ...data,
    [cols.LEGAL_CITY_COORDINATES]: new Geo(
        data[cols.LEGAL_CITY_COORDINATES][HOMELESS_COLUMNS.LONGITUDE],
        data[cols.LEGAL_CITY_COORDINATES][HOMELESS_COLUMNS.LATITUDE],
    ),
});

module.exports = {
    formatInitialDataToSave,
    formatCompanyDataOnStep2,
};
