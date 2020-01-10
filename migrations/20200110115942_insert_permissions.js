const FIRST_ROLES = require('./20191017143230_add_roles').ROLES;
const CONTROL_ROLES = require('./20191023095323_insert_roles').ROLES;
const DISPATCHER_ROLES = require('./20191026063335_insert_dispatcher_role.js').ROLES;
const DRIVER_ROLES = require('./20191101090430_insert_driver_role').ROLES;

const { getRolesToPermissionsForDb } = require('../app/formatters/system');

const PERMISSIONS = [
    {
        id: '768acea9-b85b-433e-8fee-aeb95f9d8802',
        name: 'read_driver_deals',
    },
];

const ALL_PERMISSIONS = [
    ...PERMISSIONS,
];

const ALL_ROLES = [
    ...FIRST_ROLES,
    ...CONTROL_ROLES,
    ...DISPATCHER_ROLES,
    ...DRIVER_ROLES,
];

const ROLES_WITH_PERMISSIONS = [
    ['admin', [
        'read_driver_deals',
    ]],
    ['manager', [
        'read_driver_deals',
    ]],
    ['transporter', [
        'read_driver_deals',
    ]],
    ['dispatcher', [
        'read_driver_deals',
    ]],
    ['driver', [
        'read_driver_deals',
    ]],
];

exports.PERMISSIONS = PERMISSIONS;

const allRolesWithPermissions = getRolesToPermissionsForDb(ALL_ROLES, ALL_PERMISSIONS, ROLES_WITH_PERMISSIONS);

exports.up = function(knex) {
    return knex.batchInsert('permissions', PERMISSIONS)
        .then(function () {
            return knex.batchInsert('roles_to_permissions', allRolesWithPermissions);
        });
};

exports.down = function(knex) {
    return Promise.all(allRolesWithPermissions.map(({ role_id, permission_id }) => (
        knex('roles_to_permissions')
            .where('role_id', role_id)
            .andWhere('permission_id', permission_id)
            .del()
    )))
        .then(function () {
            return Promise.all(PERMISSIONS.map(permission => (
                knex('permissions')
                    .where('id', permission.id)
                    .del()
            )));
        });
};
