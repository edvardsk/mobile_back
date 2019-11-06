const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.PHONE_NUMBERS;

const cols = table.COLUMNS;

const insertRecord = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFields(values)
    .returning('*')
    .toString();

const getRecordByPhoneNumber = number => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.NUMBER} = '${number}'`)
    .toString();

const updateRecordByUserId = (userId, values) => squelPostgres
    .update()
    .table(table.NAME)
    .setFields(values)
    .where(`${cols.USER_ID} = '${userId}'`)
    .returning('*')
    .toString();

module.exports = {
    insertRecord,
    getRecordByPhoneNumber,
    updateRecordByUserId,
};
