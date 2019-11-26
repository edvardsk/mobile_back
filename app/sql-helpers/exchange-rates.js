const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.EXCHANGE_RATES;

const cols = table.COLUMNS;

const selectRecordsByCountriesIds = ids => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.COUNTRY_ID} IN ?`, ids)
    .toString();

module.exports = {
    selectRecordsByCountriesIds,
};
