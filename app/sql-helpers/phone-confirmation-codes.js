const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');
const table = SQL_TABLES.PHONE_CONFIRMATION_CODES;
const cols = table.COLUMNS;

const insertRecord = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFields(values)
    .returning('*')
    .toString();

const selectRecordsByUserId = userId => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.USER_ID} = '${userId}'`)
    .order(cols.CREATED_AT, false)
    .toString();

const selectRecordsCountByUserId = userId => squelPostgres
    .select()
    .from(table.NAME)
    .field('COUNT(id)')
    .where(`${cols.USER_ID} = '${userId}'`)
    .toString();

const selectLatestRecordsByUserId = userId => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.USER_ID} = '${userId}'`)
    .order(cols.CREATED_AT, false)
    .limit(1)
    .toString();

module.exports = {
    insertRecord,
    selectRecordsByUserId,
    selectRecordsCountByUserId,
    selectLatestRecordsByUserId,
};
