const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.PERMISSIONS;
const tableUsersPermissions = SQL_TABLES.USERS_TO_PERMISSIONS;
const tableUsersRoles = SQL_TABLES.USERS_TO_ROLES;
const tableRolesPermissions = SQL_TABLES.ROLES_TO_PERMISSIONS;

const colsUsersPermissions = tableUsersPermissions.COLUMNS;
const colsUsersRoles = tableUsersRoles.COLUMNS;
const colsRolesPermissions = tableRolesPermissions.COLUMNS;

const selectAllPermissionsByUserId = userId => squelPostgres
    .select()
    .from(table.NAME, 'p')
    .field('DISTINCT p.id')
    .field('p.*')
    .where(
        squel
            .expr()
            .and(`up.${colsUsersPermissions.USER_ID} = '${userId}'`)
            .or(`ur.${colsUsersRoles.USER_ID} = '${userId}'`)
    )
    .left_join(tableUsersPermissions.NAME, 'up', `up.${colsUsersPermissions.PERMISSION_ID} = p.id`)
    .left_join(tableRolesPermissions.NAME, 'rp', `rp.${colsRolesPermissions.PERMISSION_ID} = p.id`)
    .left_join(tableUsersRoles.NAME, 'ur', `ur.${colsUsersRoles.ROLE_ID} = rp.${colsRolesPermissions.ROLE_ID}`)
    .toString();

module.exports = {
    selectAllPermissionsByUserId,
};


