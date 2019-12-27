const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.DEALS_TO_FILES;

const cols = table.COLUMNS;

const insertRecords = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFieldsRows(values)
    .returning('*')
    .toString();

const deleteRecordsByFileIds = fileIds => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`${cols.FILE_ID} IN ?`, fileIds)
    .returning('*')
    .toString();

module.exports = {
    insertRecords,
    deleteRecordsByFileIds,
};
