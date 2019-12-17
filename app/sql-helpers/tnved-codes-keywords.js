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

const selectRecordsByTNVEDIdAndLanguage = (tnvedId, languageId) => squelPostgres
    .select()
    .from(table.NAME, 'k')
    .where(`${cols.TNVED_CODE_ID} = '${tnvedId}'`)
    .where(`${cols.LANGUAGE_ID} = '${languageId}'`)
    .toString();

const deleteRecordByKeywordId = keywordId => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`id = '${keywordId}'`)
    .returning('*')
    .toString();

module.exports = {
    insertRecord,
    selectRecords,
    selectRecordsByTNVEDIdAndLanguage,
    deleteRecordByKeywordId,
};