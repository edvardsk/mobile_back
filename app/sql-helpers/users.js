const squel = require('squel');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.USERS;
const tableUsersRoles = SQL_TABLES.USERS_TO_ROLES;
const tableRoles = SQL_TABLES.ROLES;

const cols = table.COLUMNS;
const colsUsersRoles = tableUsersRoles.COLUMNS;
const colsRoles = tableRoles.COLUMNS;

const insertUser = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFields(values)
    .returning('*')
    .toString();

const selectUser = id => squelPostgres
    .select()
    .from(table.NAME)
    .where(`id = '${id}'`)
    .toString();

const selectUserWithRole = id => squelPostgres
    .select()
    .from(table.NAME, 'u')
    .field('u.*')
    .field('r.name', HOMELESS_COLUMNS.ROLE)
    .where(`u.id = '${id}'`)
    .left_join(tableUsersRoles.NAME, 'ur', `ur.${colsUsersRoles.USER_ID} = u.id`)
    .left_join(tableRoles.NAME, 'r', `r.id = ur.${colsUsersRoles.ROLE_ID}`)
    .toString();

const selectUserByEmail = email => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.EMAIL} = '${email}'`)
    .toString();

const selectUserByEmailWithRole = email => squelPostgres
    .select()
    .from(table.NAME, 'u')
    .field('u.*')
    .field('r.name', HOMELESS_COLUMNS.ROLE)
    .where(`u.${cols.EMAIL} = '${email}'`)
    .left_join(tableUsersRoles.NAME, 'ur', `ur.${colsUsersRoles.USER_ID} = u.id`)
    .left_join(tableRoles.NAME, 'r', `r.id = ur.${colsUsersRoles.ROLE_ID}`)
    .toString();

const updateUser = (id, data) => squelPostgres
    .update()
    .table(table.NAME)
    .setFields(data)
    .where(`id = '${id}'`)
    .returning('*')
    .toString();

const selectUserRole = id => squelPostgres
    .select()
    .from(table.NAME, 'u')
    .where(`u.id = '${id}'`)
    .field(`r.${colsRoles.NAME}`)
    .left_join(tableUsersRoles.NAME, 'ur', `ur.${colsUsersRoles.USER_ID} = u.id`)
    .left_join(tableRoles.NAME, 'r', `r.id = ur.${colsUsersRoles.ROLE_ID}`)
    .toString();

const selectUserByPassportNumber = number => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.PASSPORT_NUMBER} = '${number}'`)
    .toString();

module.exports = {
    insertUser,
    selectUser,
    selectUserWithRole,
    selectUserByEmail,
    selectUserByEmailWithRole,
    updateUser,
    selectUserRole,
    selectUserByPassportNumber,
};
