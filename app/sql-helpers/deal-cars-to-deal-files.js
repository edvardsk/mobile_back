const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.DEAL_CARS_TO_FILES;
const tableDealFiles = SQL_TABLES.DEAL_FILES;

const cols = table.COLUMNS;

const insertRecords = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFieldsRows(values)
    .returning('*')
    .toString();

const selectFilesByDealCarId = dealCarId => squelPostgres
    .select()
    .from(table.NAME, 'dcf')
    .where(`dcf.${cols.DEAL_CAR_ID} = '${dealCarId}'`)
    .left_join(tableDealFiles.NAME, 'f', `f.id = dcf.${cols.DEAL_FILE_ID}`)
    .toString();

const deleteRecordsByFileIds = fileIds => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`${cols.DRAFT_FILE_ID} IN ?`, fileIds)
    .returning('*')
    .toString();

module.exports = {
    insertRecords,
    selectFilesByDealCarId,
    deleteRecordsByFileIds,
};
