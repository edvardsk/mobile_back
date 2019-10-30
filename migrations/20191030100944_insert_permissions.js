const { getRolesToPermissionsForDb } = require('../app/formatters/system');
const FIRST_ROLES = require('./20191017143230_add_roles').ROLES;
const CONTROL_ROLES = require('./20191023095323_insert_roles').ROLES;
const DISPATCHER_ROLES = require('./20191026063335_insert_dispatcher_role').ROLES;
const LOGISTICIAN_ROLES = require('./20191029090142_insert_logistician_role').ROLES;

const PERMISSIONS = [
    {
        id: '2ce9ce7e-413f-4e1a-ac15-46b96cfdd7ab',
        name: 'read_legal_info',
    },
];

const ROLES_WITH_PERMISSIONS = [
    ['admin', [
        'read_legal_info',
    ]],
    ['manager', [
        'read_legal_info',
    ]],
    ['transporter', [
        'read_legal_info',
    ]],
    ['holder', [
        'read_legal_info',
    ]],
    ['dispatcher', [
        'read_legal_info',
    ]],
    ['logistician', [
        'read_legal_info',
    ]],
];

const ALL_ROLES = [
    ...FIRST_ROLES,
    ...CONTROL_ROLES,
    ...DISPATCHER_ROLES,
    ...LOGISTICIAN_ROLES,
];

const ALL_PERMISSIONS = [
    ...PERMISSIONS,
];

const allRolesWithPermissions = getRolesToPermissionsForDb(ALL_ROLES, ALL_PERMISSIONS, ROLES_WITH_PERMISSIONS);

exports.PERMISSIONS = PERMISSIONS;

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
