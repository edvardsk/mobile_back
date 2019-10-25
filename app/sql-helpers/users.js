const squel = require('squel');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.USERS;
const tableRoles = SQL_TABLES.ROLES;
const tablePermissions = SQL_TABLES.PERMISSIONS;
const tableUsersRoles = SQL_TABLES.USERS_TO_ROLES;
const tableUsersPermissions = SQL_TABLES.USERS_TO_PERMISSIONS;
const tableEmailConfirmationHashes = SQL_TABLES.EMAIL_CONFIRMATION_HASHES;

const cols = table.COLUMNS;
const colsRoles = tableRoles.COLUMNS;
const colsPermissions = tablePermissions.COLUMNS;
const colsUsersRoles = tableUsersRoles.COLUMNS;
const colsUsersPermissions = tableUsersPermissions.COLUMNS;
const colsEmailConfirmationHashes = tableEmailConfirmationHashes.COLUMNS;

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

const selectUsersWithRoleByPermission = permission => squelPostgres
    .select()
    .field('u.id')
    .field(`u.${cols.EMAIL}`)
    .field(`u.${cols.FULL_NAME}`)
    .field(`r.${colsRoles.NAME}`, HOMELESS_COLUMNS.ROLE)
    .from(table.NAME, 'u')
    .where(`p.${colsPermissions.NAME} = '${permission}'`)
    .join(tableUsersPermissions.NAME, 'up', `up.${colsUsersPermissions.USER_ID} = u.id`)
    .join(tablePermissions.NAME, 'p', `p.id = up.${colsUsersPermissions.PERMISSION_ID}`)
    .left_join(tableUsersRoles.NAME, 'ur', `ur.${colsUsersRoles.USER_ID} = u.id`)
    .left_join(tableRoles.NAME, 'r', `r.id = ur.${colsUsersRoles.ROLE_ID}`)
    .toString();

const selectUserWithRoleAndConfirmationHash = email => squelPostgres
    .select()
    .field(`r.${colsRoles.NAME}`, HOMELESS_COLUMNS.ROLE)
    .field(`e.${colsEmailConfirmationHashes.USED}`)
    .field(`e.${colsEmailConfirmationHashes.CREATED_AT}`)
    .field(`e.${colsEmailConfirmationHashes.EXPIRED_AT}`)
    .from(table.NAME, 'u')
    .where(`u.${cols.EMAIL} = '${email}'`)
    .left_join(tableEmailConfirmationHashes.NAME, 'e', `u.id = e.${colsEmailConfirmationHashes.USER_ID}`)
    .left_join(tableUsersRoles.NAME, 'ur', `ur.${colsUsersRoles.USER_ID} = u.id`)
    .left_join(tableRoles.NAME, 'r', `r.id = ur.${colsUsersRoles.ROLE_ID}`)
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
    selectUsersWithRoleByPermission,
    selectUserWithRoleAndConfirmationHash,
};
