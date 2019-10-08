const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.ROLES_TO_PERMISSIONS;
const tableUsersRoles = SQL_TABLES.USERS_TO_ROLES;
const tablePermissions = SQL_TABLES.PERMISSIONS;

const cols = table.COLUMNS;
const colsUsersRoles = tableUsersRoles.COLUMNS;

const selectUserPermissions = userId => squelPostgres
    .select()
    .from(table.NAME, 'rp')
    .field('p.name')
    .where(`rp.${cols.ROLE_ID} = ur.${colsUsersRoles.ROLE_ID}`)
    .left_join(tableUsersRoles.NAME, 'ur', `ur.${colsUsersRoles.USER_ID} = '${userId}'`)
    .right_join(tablePermissions.NAME, 'p', `p.id = rp.${cols.PERMISSION_ID}`)
    .toString();

module.exports = {
    selectUserPermissions,
};
