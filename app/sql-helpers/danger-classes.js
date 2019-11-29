const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.DANGER_CLASSES;

const cols = table.COLUMNS;

const selectRecordById = id => squelPostgres
    .select()
    .from(table.NAME)
    .where(`id = '${id}'`)
    .toString();

const selectRecords = () => squelPostgres
    .select()
    .from(table.NAME)
    .order(cols.CLASS, false)
    .toString();

module.exports = {
    selectRecordById,
    selectRecords,
};
