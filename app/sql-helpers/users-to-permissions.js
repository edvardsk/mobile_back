const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.USERS_TO_PERMISSIONS;
const tablePermissions = SQL_TABLES.PERMISSIONS;

const cols = table.COLUMNS;
const colsPermissions = tablePermissions.COLUMNS;

const insertUserPermission = (userId, permission) => squelPostgres
    .insert()
    .into(table.NAME)
    .fromQuery(
        [cols.USER_ID, cols.PERMISSION_ID],
        squel
            .select()
            .field(`'${userId}'`, cols.USER_ID)
            .field('id')
            .from(tablePermissions.NAME)
            .where(`${colsPermissions.NAME} = '${permission}'`)
    )
    .returning('*')
    .toString();

const deleteUserPermission = (userId, permission) => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`${cols.ROLE_ID} = (SELECT id from ${tablePermissions.NAME} WHERE ${colsPermissions.NAME} = '${permission}')`)
    .where(`${cols.USER_ID} = '${userId}'`)
    .returning('*')
    .toString();

const selectUserPermissions = userId => squelPostgres
    .select()
    .from(table.NAME, 'up')
    .field('p.name')
    .where(`up.${cols.USER_ID} = '${userId}'`)
    .right_join(tablePermissions.NAME, 'p', `p.id = up.${cols.PERMISSION_ID}`)
    .toString();

module.exports = {
    insertUserPermission,
    deleteUserPermission,
    selectUserPermissions,
};
