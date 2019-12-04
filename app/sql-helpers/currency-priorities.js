const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.CURRENCY_PRIORITIES;

const selectRecords = () => squelPostgres
    .select()
    .from(table.NAME)
    .toString();

module.exports = {
    selectRecords,
};
