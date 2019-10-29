const { getRolesToPermissionsForDb } = require('../app/formatters/system');
const FIRST_ROLES = require('./20191017143230_add_roles').ROLES;
const DISPATCHER_ROLES = require('./20191026063335_insert_dispatcher_role').ROLES;
const LOGISTICIAN_ROLES = require('./20191029090142_insert_logistician_role').ROLES;

const NEW_PERMISSIONS = [
    {
        id: '23d94583-9480-4150-bd40-e8736e9da219',
        name: 'read_employees',
    },
];

const ROLES_WITH_PERMISSIONS = [
    ['transporter', [
        'read_employees',
    ]],
    ['holder', [
        'read_employees',
    ]],
    ['dispatcher', [
        'read_employees',
    ]],
    ['logistician', [
        'read_employees',
    ]],
];

const ALL_ROLES = [
    ...FIRST_ROLES,
    ...DISPATCHER_ROLES,
    ...LOGISTICIAN_ROLES,
];

const ALL_PERMISSIONS = [
    ...NEW_PERMISSIONS,
];

const allRolesWithPermissions = getRolesToPermissionsForDb(ALL_ROLES, ALL_PERMISSIONS, ROLES_WITH_PERMISSIONS);

exports.PERMISSIONS = NEW_PERMISSIONS;

exports.up = function(knex) {
    return knex.batchInsert('permissions', NEW_PERMISSIONS)
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
            return Promise.all(NEW_PERMISSIONS.map(permission => (
                knex('permissions')
                    .where('id', permission.id)
                    .del()
            )));
        });
};
