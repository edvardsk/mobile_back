const { getRolesToPermissionsForDb } = require('../app/formatters/system');
const { ROLES } = require('./20191023095323_insert_roles');
const FIRST_PERMISSIONS = require('./20191017144540_add_permissions').PERMISSIONS;

const NEW_ROLES = [
    {
        id: '1ed572c8-8695-418a-ba14-af37a2b6ade8',
        name: 'unconfirmed_manager',
    },
    {
        id: '4706cc65-60bb-49d9-8734-ca0ded5e7661',
        name: 'confirmed_email_manager',
    },
];

const NEW_PERMISSIONS = [
    {
        id: 'cb42b59e-edb1-42d7-87d6-ff0e4f2a33cf',
        name: 'invite_manager',
    },
    {
        id: 'd6472646-78eb-44b3-bd2f-399692beb53f',
        name: 'basic_invites',
    },
];

const ROLES_WITH_PERMISSIONS = [
    ['admin', [
        'invite_manager',
        'basic_invites',
    ]],
    ['unconfirmed_manager', [
        'confirm_email',
    ]],
    ['confirmed_email_manager', [
        'authorization',
        'reset_password',
        'confirm_phone_number',
    ]],
];

const ALL_ROLES = [
    ...ROLES,
    ...NEW_ROLES,
];

const ALL_PERMISSIONS = [
    ...FIRST_PERMISSIONS,
    ...NEW_PERMISSIONS,
];

const allRolesWithPermissions = getRolesToPermissionsForDb(ALL_ROLES, ALL_PERMISSIONS, ROLES_WITH_PERMISSIONS);

exports.PERMISSIONS = NEW_PERMISSIONS;

exports.up = function(knex) {
    return knex.batchInsert('roles', NEW_ROLES)
        .then(function () {
            return knex.batchInsert('permissions', NEW_PERMISSIONS);
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
            return Promise.all(NEW_ROLES.map(role => (
                knex('users_to_roles')
                    .where('role_id', role.id)
                    .del()
            )));
        })
        .then(function () {
            return Promise.all(NEW_ROLES.map(role => (
                knex('roles')
                    .where('id', role.id)
                    .del()
            )));
        })
        .then(function () {
            return Promise.all(NEW_PERMISSIONS.map(permission => (
                knex('permissions')
                    .where('id', permission.id)
                    .del()
            )));
        });
};
