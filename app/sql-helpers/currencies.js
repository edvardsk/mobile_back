const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.CURRENCIES;

const selectCurrencyById = id => squelPostgres
    .select()
    .from(table.NAME)
    .where(`id = '${id}'`)
    .toString();

const selectCurrencies = () => squelPostgres
    .select()
    .from(table.NAME)
    .toString();

module.exports = {
    selectCurrencyById,
    selectCurrencies,
};
