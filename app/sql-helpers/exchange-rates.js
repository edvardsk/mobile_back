const squel = require('squel');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.EXCHANGE_RATES;
const tableCurrencies = SQL_TABLES.CURRENCIES;
const tableCountries = SQL_TABLES.COUNTRIES;

const cols = table.COLUMNS;
const colsCurrencies = tableCurrencies.COLUMNS;
const colsCountries = tableCountries.COLUMNS;

const insertRecords = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFieldsRows(values)
    .returning('*')
    .toString();

const deleteRecordsByCountryId = countryId => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`${cols.COUNTRY_ID} = '${countryId}' `)
    .returning('*')
    .toString();

const selectRecordsByCountriesIds = ids => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.COUNTRY_ID} IN ?`, ids)
    .toString();

const selectRecordsByCountryId = countryId => squelPostgres
    .select()
    .field('er.*')
    .field(`cur.${colsCurrencies.CODE}`, HOMELESS_COLUMNS.CURRENCY_CODE)
    .from(table.NAME, 'er')
    .where(`er.${cols.COUNTRY_ID} = '${countryId}'`)
    .left_join(tableCurrencies.NAME, 'cur', `cur.id = er.${cols.CURRENCY_ID}`)
    .toString();

const selectRecords = () => squelPostgres
    .select()
    .field('er.*')
    .field(`cou.${colsCountries.NAME}`, HOMELESS_COLUMNS.COUNTRY_NAME)
    .field(`cur_cou.${colsCurrencies.CODE}`, HOMELESS_COLUMNS.COUNTRY_CURRENCY_CODE)
    .field(`cur.${colsCurrencies.CODE}`, HOMELESS_COLUMNS.CURRENCY_CODE)
    .from(table.NAME, 'er')
    .left_join(tableCountries.NAME, 'cou', `cou.id = er.${cols.COUNTRY_ID}`)
    .left_join(tableCurrencies.NAME, 'cur', `cur.id = er.${cols.CURRENCY_ID}`)
    .left_join(tableCurrencies.NAME, 'cur_cou', `cur_cou.id = cou.${colsCountries.CURRENCY_ID}`)
    .toString();

module.exports = {
    insertRecords,
    deleteRecordsByCountryId,
    selectRecordsByCountriesIds,
    selectRecordsByCountryId,
    selectRecords,
};
