const { getRolesToPermissionsForDb } = require('../app/formatters/system');
const ADMIN_AND_MANAGER_ROLES = require('./20191023095323_insert_roles').ROLES;
const DISPATCHER_PERMISSIONS = require('./20191026063335_insert_dispatcher_role').PERMISSIONS;
const LOGISTICIAN_PERMISSIONS = require('./20191029090142_insert_logistician_role').PERMISSIONS;

const PERMISSIONS = [
    {
        id: '8e6786f5-2cbc-42b5-8c1a-e502e67ca25d',
        name: 'freeze_transporter',
    },
    {
        id: '7c6761ad-ffcc-4f47-a019-965c461cbe96',
        name: 'freeze_holder',
    },
    {
        id: '4495b768-6666-4505-ba8b-1fca60dd96d9',
        name: 'freeze_individual_forwarder',
    },
    {
        id: '29d751c4-c82c-49f5-9dbf-bd340e202eeb',
        name: 'freeze_sole_proprietor_forwarder',
    },
    {
        id: '9dd3ce61-d3e7-4a33-a586-c76fa969c2de',
        name: 'freeze_manager',
    },
    {
        id: '55f8f03e-92b4-4414-a30f-d506d44ad078',
        name: 'freeze_admin',
    },
];

const ROLES_WITH_PERMISSIONS = [
    ['admin', [
        'freeze_transporter',
        'freeze_holder',
        'freeze_individual_forwarder',
        'freeze_sole_proprietor_forwarder',
        'freeze_dispatcher',
        'freeze_logistician',
        'freeze_manager',
    ]],
    ['manager', [
        'freeze_transporter',
        'freeze_holder',
        'freeze_individual_forwarder',
        'freeze_sole_proprietor_forwarder',
        'freeze_dispatcher',
        'freeze_logistician',
    ]],
];

const ALL_ROLES = [
    ...ADMIN_AND_MANAGER_ROLES,
];

const ALL_PERMISSIONS = [
    ...PERMISSIONS,
    ...DISPATCHER_PERMISSIONS,
    ...LOGISTICIAN_PERMISSIONS,
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
