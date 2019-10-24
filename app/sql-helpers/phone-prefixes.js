const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.PHONE_PREFIXES;
const cols = table.COLUMNS;

const selectRecords = () => squelPostgres
    .select()
    .from(table.NAME)
    .toString();

const selectRecordById = id => squelPostgres
    .select()
    .from(table.NAME)
    .where(`id = '${id}'`)
    .toString();

const selectRecordByCode = code => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.CODE} = '${code}'`)
    .toString();

module.exports = {
    selectRecords,
    selectRecordById,
    selectRecordByCode,
};
