const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.DEAL_TRAILERS_TO_FILES;
const tableDealFiles = SQL_TABLES.DEAL_FILES;

const cols = table.COLUMNS;

const insertRecords = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFieldsRows(values)
    .returning('*')
    .toString();

const selectFilesByDealTrailerId = dealTrailerId => squelPostgres
    .select()
    .from(table.NAME, 'dtf')
    .where(`dtf.${cols.DEAL_TRAILER_ID} = '${dealTrailerId}'`)
    .left_join(tableDealFiles.NAME, 'f', `f.id = dtf.${cols.DEAL_FILE_ID}`)
    .toString();

const deleteRecordsByFileIds = fileIds => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`${cols.DRAFT_FILE_ID} IN ?`, fileIds)
    .returning('*')
    .toString();

module.exports = {
    insertRecords,
    selectFilesByDealTrailerId,
    deleteRecordsByFileIds,
};
