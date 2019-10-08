const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.USERS_TO_ROLES;
const tableRoles = SQL_TABLES.ROLES;

const cols = table.COLUMNS;
const colsRoles = tableRoles.COLUMNS;

const insertUserRole = (userId, role) => squelPostgres
    .insert()
    .into(table.NAME)
    .fromQuery(
        [cols.ROLE_ID, cols.USER_ID],
        squel
            .select()
            .field('id')
            .field(`'${userId}'`, cols.USER_ID)
            .from(tableRoles.NAME)
            .where(`${colsRoles.NAME} = '${role}'`)
    )
    .returning('*')
    .toString();

const deleteUserRole = (userId, role) => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`${cols.ROLE_ID} = (SELECT id from ${tableRoles.NAME} WHERE ${colsRoles.NAME} = '${role}')`)
    .where(`${cols.USER_ID} = '${userId}'`)
    .returning('*')
    .toString();

const updateUserRoleByUserId = (userId, role) => squelPostgres
    .update()
    .table(table.NAME)
    .set(cols.ROLE_ID, squel
        .select()
        .field('id')
        .from(tableRoles.NAME)
        .where(`${colsRoles.NAME} = '${role}'`)
    )
    .where(`${cols.USER_ID} = '${userId}'`)
    .returning('*')
    .toString();

module.exports = {
    insertUserRole,
    deleteUserRole,
    updateUserRoleByUserId,
};
