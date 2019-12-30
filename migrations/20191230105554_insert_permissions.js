const FIRST_ROLES = require('./20191017143230_add_roles').ROLES;
const CONTROL_ROLES = require('./20191023095323_insert_roles').ROLES;
const DISPATCHER_ROLES = require('./20191026063335_insert_dispatcher_role.js').ROLES;
const LOGISTICIAN_ROLES = require('./20191029090142_insert_logistician_role.js').ROLES;
const DRIVER_ROLES = require('./20191101090430_insert_driver_role.js').ROLES;

const { getRolesToPermissionsForDb } = require('../app/formatters/system');

const PERMISSIONS = [
    {
        id: '6af7e5c4-1d0b-46b9-b5d0-bfe7e7eaa4cd',
        name: 'change_deal_status_base',
    },
    {
        id: 'c960d2fb-8ac0-4e5f-b35e-1b5daa6fa140',
        name: 'change_deal_status_advanced',
    },
];

const ALL_PERMISSIONS = [
    ...PERMISSIONS,
];

const ALL_ROLES = [
    ...FIRST_ROLES,
    ...CONTROL_ROLES,
    ...DISPATCHER_ROLES,
    ...LOGISTICIAN_ROLES,
    ...DRIVER_ROLES,
];

const ROLES_WITH_PERMISSIONS = [
    ['admin', [
        'change_deal_status_base',
        'change_deal_status_advanced',
    ]],
    ['manager', [
        'change_deal_status_base',
        'change_deal_status_advanced',
    ]],
    ['transporter', [
        'change_deal_status_base',
        'change_deal_status_advanced',
    ]],
    ['holder', [
        'change_deal_status_base',
        'change_deal_status_advanced',
    ]],
    ['dispatcher', [
        'change_deal_status_base',
        'change_deal_status_advanced',
    ]],
    ['logistician', [
        'change_deal_status_base',
        'change_deal_status_advanced',
    ]],
    ['driver', [
        'change_deal_status_base',
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
