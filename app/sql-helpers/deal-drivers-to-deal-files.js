const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.DEAL_DRIVERS_TO_FILES;
const tableDealFiles = SQL_TABLES.DEAL_FILES;

const cols = table.COLUMNS;

const insertRecords = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFieldsRows(values)
    .returning('*')
    .toString();

const selectFilesByDealDriverId = dealDriverId => squelPostgres
    .select()
    .from(table.NAME, 'ddf')
    .where(`ddf.${cols.DEAL_DRIVER_ID} = '${dealDriverId}'`)
    .left_join(tableDealFiles.NAME, 'f', `f.id = ddf.${cols.DEAL_FILE_ID}`)
    .toString();

const deleteRecordsByFileIds = fileIds => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`${cols.DEAL_FILE_ID} IN ?`, fileIds)
    .returning('*')
    .toString();

module.exports = {
    insertRecords,
    selectFilesByDealDriverId,
    deleteRecordsByFileIds,
};
