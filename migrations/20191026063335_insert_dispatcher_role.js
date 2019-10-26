const FIRST_PERMISSIONS = require('./20191017144540_add_permissions').PERMISSIONS;
const { getRolesToPermissionsForDb } = require('../app/formatters/system');


const ROLES = [
    {
        id: 'abe08792-d1ab-41c4-813d-1ac50017392c',
        name: 'unconfirmed_dispatcher',
    },
    {
        id: '36389e2f-2c63-4628-a13a-c6ff061c735e',
        name: 'confirmed_email_dispatcher',
    },
    {
        id: '08177560-c766-44c6-a529-c70194203e2f',
        name: 'dispatcher',
    },
];

const PERMISSIONS = [
    {
        id: 'cce7e178-1957-4857-b077-322e0452604a',
        name: 'invite_dispatcher'
    },
    {
        id: '779c7292-6af1-485b-9b21-0fef3c30f228',
        name: 'invite_transporter',
    },
];

const ALL_PERMISSIONS = [
    ...FIRST_PERMISSIONS,
    ...PERMISSIONS,
];

const ROLES_WITH_PERMISSIONS = [
    ['unconfirmed_dispatcher', [
        'confirm_email',
    ]],
    ['confirmed_email_dispatcher', [
        'authorization',
        'reset_password',
        'confirm_phone_number',
    ]],
    ['dispatcher', [
        'authorization',
        'reset_password',
    ]],
];

const allRolesWithPermissions = getRolesToPermissionsForDb(ROLES, ALL_PERMISSIONS, ROLES_WITH_PERMISSIONS);

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
                knex('users_to_roles')
                    .where('role_id', role.id)
                    .del()
            )));
        })
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

exports.ROLES = ROLES;
