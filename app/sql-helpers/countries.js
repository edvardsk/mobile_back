const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.COUNTRIES;

const selectCountryById = id => squelPostgres
    .select()
    .from(table.NAME)
    .where(`id = '${id}'`)
    .toString();

const selectCountries = () => squelPostgres
    .select()
    .from(table.NAME)
    .toString();

module.exports = {
    selectCountryById,
    selectCountries,
};
