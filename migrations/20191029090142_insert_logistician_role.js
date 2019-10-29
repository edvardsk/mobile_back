const FIRST_PERMISSIONS = require('./20191017144540_add_permissions').PERMISSIONS;
const LATEST_PERMISSIONS = require('./20191024092329_insert_permissions').PERMISSIONS;
const FIRST_ROLES = require('./20191017143230_add_roles').ROLES;
const { getRolesToPermissionsForDb } = require('../app/formatters/system');


const ROLES = [
    {
        id: 'c5ddc74b-0148-4e39-a225-d4504a482cd3',
        name: 'unconfirmed_logistician',
    },
    {
        id: '259ede50-bae5-4565-9e3b-4a071361e505',
        name: 'confirmed_email_logistician',
    },
    {
        id: '875989b2-dddf-4835-9f54-5bc51d63b8c6',
        name: 'logistician',
    },
];

const PERMISSIONS = [
    {
        id: '37045f1a-dae4-46ce-a5d7-41f77de4ef99',
        name: 'invite_logistician'
    },
    {
        id: '8f8e2650-bb61-4278-85e1-10b599bd4afa',
        name: 'freeze_logistician',
    },
    {
        id: 'd56a5a39-0f53-4e3c-a3f4-ac9a7187ca18',
        name: 'unfreeze_logistician',
    },
];

const ALL_PERMISSIONS = [
    ...FIRST_PERMISSIONS,
    ...LATEST_PERMISSIONS,
    ...PERMISSIONS,
];

const ALL_ROLES = [
    ...FIRST_ROLES,
    ...ROLES,
];

const ROLES_WITH_PERMISSIONS = [
    ['unconfirmed_logistician', [
        'confirm_email',
    ]],
    ['confirmed_email_logistician', [
        'authorization',
        'reset_password',
        'confirm_phone_number',
    ]],
    ['logistician', [
        'authorization',
        'reset_password',
    ]],
    ['holder', [
        'invite_logistician',
        'freeze_logistician',
        'unfreeze_logistician',
        'basic_invites',
    ]],
];

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
