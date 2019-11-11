const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.USERS_TO_FILES;
const tableFiles = SQL_TABLES.FILES;

const cols = table.COLUMNS;

const insertRecords = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFieldsRows(values)
    .returning('*')
    .toString();

const selectFilesByUserId = userId => squelPostgres
    .select()
    .from(table.NAME, 'cf')
    .where(`cf.${cols.USER_ID} = '${userId}'`)
    .left_join(tableFiles.NAME, 'f', `f.id = cf.${cols.FILE_ID}`)
    .toString();

const deleteRecordsByUserId = userId => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`${cols.USER_ID} = '${userId}'`)
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
    selectFilesByUserId,
    deleteRecordsByUserId,
    deleteRecordsByFileIds,
};
