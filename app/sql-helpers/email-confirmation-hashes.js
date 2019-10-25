const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');
const table = SQL_TABLES.EMAIL_CONFIRMATION_HASHES;
const tableUsers = SQL_TABLES.USERS;
const tableRoles = SQL_TABLES.ROLES;
const tableUsersRoles = SQL_TABLES.USERS_TO_ROLES;

const cols = table.COLUMNS;
const colsUsers = tableUsers.COLUMNS;
const colsUsersRoles = tableUsersRoles.COLUMNS;

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

const deleteRecordById = id => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`id = '${id}'`)
    .returning('*')
    .toString();

const updateRecordById = (id, values) => squelPostgres
    .update()
    .table(table.NAME)
    .setFields(values)
    .where(`id = '${id}'`)
    .returning('*')
    .toString();

const selectLatestRecordByUserEmail = email => squelPostgres
    .select()
    .field('e.*')
    .from(table.NAME, 'e')
    .where(`u.${colsUsers.EMAIL} = '${email}'`)
    .left_join(tableUsers.NAME, 'u', `u.id = e.${cols.USER_ID}`)
    .left_join(tableUsersRoles.NAME, 'ur', `ur.${colsUsersRoles.USER_ID} = u.id`)
    .left_join(tableRoles.NAME, 'r', `r.id = ur.${colsUsersRoles.ROLE_ID}`)
    .order(cols.CREATED_AT, false)
    .limit(1)
    .toString();

module.exports = {
    insertRecord,
    selectRecordByHash,
    deleteRecordById,
    updateRecordById,
    selectLatestRecordByUserEmail,
};
