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

const selectRecordByTwoUsersIds = (user1, user2) => squelPostgres
    .select()
    .from(table.NAME, 'a')
    .where(`${cols.USER_ID} = '${user1}'`)
    .union(
        squelPostgres
            .select()
            .from(table.NAME, 'b')
            .where(`${cols.USER_ID} = '${user2}'`)
    )
    .toString();

const selectRecordByCompanyIdAndUserId = (companyId, userId) => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.COMPANY_ID} = '${companyId}'`)
    .where(`${cols.USER_ID} = '${userId}'`)
    .toString();

module.exports = {
    selectRecordByUserId,
    insertRecord,
    selectRecordByTwoUsersIds,
    selectRecordByCompanyIdAndUserId,
};
