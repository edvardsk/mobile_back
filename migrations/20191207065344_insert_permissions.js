const FIRST_ROLES = require('./20191017143230_add_roles').ROLES;
const CONTROL_ROLES = require('./20191023095323_insert_roles').ROLES;
const DISPATCHER_ROLES = require('./20191026063335_insert_dispatcher_role.js').ROLES;


const { getRolesToPermissionsForDb } = require('../app/formatters/system');

const PERMISSIONS = [
    {
        id: 'fcc01990-723d-4702-99ab-a99bd1526e9c',
        name: 'create_cargo_deal',
    },
];

const ALL_PERMISSIONS = [
    ...PERMISSIONS,
];

const ALL_ROLES = [
    ...FIRST_ROLES,
    ...CONTROL_ROLES,
    ...DISPATCHER_ROLES,
];

const ROLES_WITH_PERMISSIONS = [
    ['admin', [
        'create_cargo_deal',
    ]],
    ['manager', [
        'create_cargo_deal',
    ]],
    ['transporter', [
        'create_cargo_deal',
    ]],
    ['dispatcher', [
        'create_cargo_deal',
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
