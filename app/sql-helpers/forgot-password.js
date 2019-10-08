const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');
const table = SQL_TABLES.FORGOT_PASSWORD;
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

const selectLatestActiveRecordByUserId = userId => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.USER_ID} = '${userId}'`)
    .where(`${cols.EXPIRED_AT} > NOW()`)
    .order(cols.CREATED_AT, false)
    .limit(1)
    .toString();

const deleteRecordsByUserId = userId => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`${cols.USER_ID} = '${userId}'`)
    .returning('*')
    .toString();

module.exports = {
    insertRecord,
    selectRecordByHash,
    selectLatestActiveRecordByUserId,
    deleteRecordsByUserId,
};
