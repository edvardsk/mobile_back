const squel = require('squel');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.COUNTRIES;
const tableCurrencies = SQL_TABLES.CURRENCIES;

const cols = table.COLUMNS;
const colsCurrencies = tableCurrencies.COLUMNS;

const selectCountryById = id => squelPostgres
    .select()
    .from(table.NAME)
    .where(`id = '${id}'`)
    .toString();

const selectCountries = () => squelPostgres
    .select()
    .from(table.NAME)
    .toString();

const selectCountriesWithCurrencies = () => squelPostgres
    .select()
    .field('co.*')
    .field(`cu.${colsCurrencies.CODE}`, HOMELESS_COLUMNS.CURRENCY_CODE)
    .from(table.NAME, 'co')
    .left_join(tableCurrencies.NAME, 'cu', `cu.id = co.${cols.CURRENCY_ID}`)
    .toString();

module.exports = {
    selectCountryById,
    selectCountries,
    selectCountriesWithCurrencies,
};
