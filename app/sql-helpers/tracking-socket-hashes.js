const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');
const table = SQL_TABLES.TRACKING_SOCKET_HASHES;

const cols = table.COLUMNS;

const insertRecord = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFields(values)
    .returning('*')
    .toString();

const selectRecordByHash = hash => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.HASH} = '${hash}'`)
    .toString();

const deleteRecordsByUserId = userId => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`${cols.USER_ID} = '${userId}'`)
    .returning('*')
    .toString();

const deleteRecordById = id => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`id = '${id}'`)
    .returning('*')
    .toString();

module.exports = {
    insertRecord,
    selectRecordByHash,
    deleteRecordById,
    deleteRecordsByUserId,
};
