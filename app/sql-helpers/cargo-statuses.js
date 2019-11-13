const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.CARGO_STATUSES;

const cols = table.COLUMNS;

const selectRecordByName = name => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.NAME} = '${name}'`)
    .toString();

const selectRecords = () => squelPostgres
    .select()
    .from(table.NAME)
    .toString();

module.exports = {
    selectRecordByName,
    selectRecords,
};
