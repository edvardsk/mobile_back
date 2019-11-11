const FIRST_PERMISSIONS = require('./20191017144540_add_permissions').PERMISSIONS;
const READ_LEGAL_INFO_PERMISSIONS = require('./20191030100944_insert_permissions.js').PERMISSIONS;
const BASIC_INVITES_PERMISSIONS = require('./20191024092329_insert_permissions.js').PERMISSIONS;

const FIRST_ROLES = require('./20191017143230_add_roles').ROLES;
const CONTROL_ROLES = require('./20191023095323_insert_roles').ROLES;
const DISPATCHER_ROLES = require('./20191026063335_insert_dispatcher_role.js').ROLES;

const { getRolesToPermissionsForDb } = require('../app/formatters/system');

const ROLES = [
    {
        id: '01554a03-fde4-459f-be07-56b688282dc0',
        name: 'unconfirmed_driver',
    },
    {
        id: '106e500a-f707-4d07-a4c4-1e5c60675a38',
        name: 'confirmed_email_driver',
    },
    {
        id: 'dd666275-1b02-4db3-829b-1f35a7535a55',
        name: 'driver',
    },
];

const PERMISSIONS = [
    {
        id: 'a3028911-1491-4cef-b3a3-7e2e82115111',
        name: 'invite_driver'
    },
    {
        id: 'c125e481-a547-4377-84b4-7864600e4dcc',
        name: 'freeze_driver',
    },
];

const ALL_PERMISSIONS = [
    ...FIRST_PERMISSIONS,
    ...READ_LEGAL_INFO_PERMISSIONS,
    ...BASIC_INVITES_PERMISSIONS,
    ...PERMISSIONS,
];

const ALL_ROLES = [
    ...FIRST_ROLES,
    ...CONTROL_ROLES,
    ...DISPATCHER_ROLES,
    ...ROLES,
];

const ROLES_WITH_PERMISSIONS = [
    ['unconfirmed_driver', [
        'confirm_email',
    ]],
    ['confirmed_email_driver', [
        'authorization',
        'reset_password',
        'confirm_phone_number',
    ]],
    ['driver', [
        'authorization',
        'reset_password',
        'read_legal_info',
    ]],

    ['admin', [
        'invite_driver',
        'freeze_driver',
    ]],
    ['manager', [
        'invite_driver',
        'freeze_driver',
    ]],
    ['transporter', [
        'invite_driver',
        'freeze_driver',
    ]],
    ['dispatcher', [
        'invite_driver',
        'freeze_driver',
        'basic_invites',
    ]],
];

exports.PERMISSIONS = PERMISSIONS;

const allRolesWithPermissions = getRolesToPermissionsForDb(ALL_ROLES, ALL_PERMISSIONS, ROLES_WITH_PERMISSIONS);

exports.up = function(knex) {
    return knex.batchInsert('roles', ROLES)
        .then(function () {
            return knex.batchInsert('permissions', PERMISSIONS);
        })
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
            return Promise.all(ROLES.map(role => (
                knex('roles')
                    .where('id', role.id)
                    .del()
            )));
        })
        .then(function () {
            return Promise.all(PERMISSIONS.map(permission => (
                knex('permissions')
                    .where('id', permission.id)
                    .del()
            )));
        });
};
