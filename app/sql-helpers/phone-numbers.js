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

const selectRecordByPhoneNumberAndPrefixId = (number, prefixId) => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.NUMBER} = '${number}'`)
    .where(`${cols.PHONE_PREFIX_ID} = '${prefixId}'`)
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
    selectRecordByPhoneNumberAndPrefixId,
    updateRecordByUserId,
};
