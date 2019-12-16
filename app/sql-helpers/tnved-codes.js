const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.TNVED_CODES;

const selectRecords = () => squelPostgres
    .select()
    .from(table.NAME)
    .toString();

module.exports = {
    selectRecords,
};
