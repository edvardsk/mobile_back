const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.DRAFT_DRIVERS_TO_FILES;
const tableDraftFiles = SQL_TABLES.DRAFT_FILES;

const cols = table.COLUMNS;

const insertRecords = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFieldsRows(values)
    .returning('*')
    .toString();

const selectFilesByDraftDriverId = draftDriverId => squelPostgres
    .select()
    .from(table.NAME, 'ddf')
    .where(`ddf.${cols.DRAFT_DRIVER_ID} = '${draftDriverId}'`)
    .left_join(tableDraftFiles.NAME, 'f', `f.id = ddf.${cols.DRAFT_FILE_ID}`)
    .toString();

const deleteRecordsByFileIds = fileIds => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`${cols.DRAFT_FILE_ID} IN ?`, fileIds)
    .returning('*')
    .toString();

module.exports = {
    insertRecords,
    selectFilesByDraftDriverId,
    deleteRecordsByFileIds,
};