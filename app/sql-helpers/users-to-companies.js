const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.USERS_TO_COMPANIES;

const cols = table.COLUMNS;

const selectRecordByUserId = userId => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.USER_ID} = '${userId}'`)
    .toString();

const insertRecord = values => {
    return squelPostgres
        .insert()
        .into(table.NAME)
        .setFields(values)
        .returning('*')
        .toString();
};

module.exports = {
    selectRecordByUserId,
    insertRecord,
};
