const squel = require('squel');

// constants
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.TNVED_CODES_KEYWORDS;
const cols = table.COLUMNS;

const insertRecord = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFields(values)
    .returning('*')
    .toString();

const selectRecords = () => squelPostgres
    .select()
    .from(table.NAME)
    .toString();

const selectRecordsByTNVEDId = tnvedId => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.TNVED_CODE_ID} = '${tnvedId}'`)
    .toString();

module.exports = {
    insertRecord,
    selectRecords,
    selectRecordsByTNVEDId,
};