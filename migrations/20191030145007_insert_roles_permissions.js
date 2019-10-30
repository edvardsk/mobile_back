const { getRolesToPermissionsForDb } = require('../app/formatters/system');
const CONTROL_ROLES = require('./20191023095323_insert_roles').ROLES;
const READ_EMPLOYEES_PERMISSIONS = require('./20191029101059_insert_permissions').PERMISSIONS;

const ROLES_WITH_PERMISSIONS = [
    ['admin', [
        'read_employees',
    ]],
    ['manager', [
        'read_employees',
    ]],
];

const ALL_ROLES = [
    ...CONTROL_ROLES,
];

const ALL_PERMISSIONS = [
    ...READ_EMPLOYEES_PERMISSIONS,
];

const allRolesWithPermissions = getRolesToPermissionsForDb(ALL_ROLES, ALL_PERMISSIONS, ROLES_WITH_PERMISSIONS);

exports.up = function(knex) {
    return knex.batchInsert('roles_to_permissions', allRolesWithPermissions);
};

exports.down = function(knex) {
    return Promise.all(allRolesWithPermissions.map(({ role_id, permission_id }) => (
        knex('roles_to_permissions')
            .where('role_id', role_id)
            .andWhere('permission_id', permission_id)
            .del()
    )));
};
