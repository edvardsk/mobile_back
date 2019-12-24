const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.DRAFT_CARS_TO_FILES;
const tableDraftFiles = SQL_TABLES.DRAFT_FILES;

const cols = table.COLUMNS;

const insertRecords = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFieldsRows(values)
    .returning('*')
    .toString();

const selectFilesByDraftCarId = draftCarId => squelPostgres
    .select()
    .from(table.NAME, 'dcf')
    .where(`dcf.${cols.DRAFT_CAR_ID} = '${draftCarId}'`)
    .left_join(tableDraftFiles.NAME, 'f', `f.id = dcf.${cols.DRAFT_FILE_ID}`)
    .toString();

const deleteRecordsByFileIds = fileIds => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`${cols.DRAFT_FILE_ID} IN ?`, fileIds)
    .returning('*')
    .toString();

module.exports = {
    insertRecords,
    selectFilesByDraftCarId,
    deleteRecordsByFileIds,
};
