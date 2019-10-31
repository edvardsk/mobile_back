const { getRolesToPermissionsForDb } = require('../app/formatters/system');
const FIRST_ROLES = require('./20191017143230_add_roles').ROLES;
const FIRST_PERMISSIONS = require('./20191017144540_add_permissions.js').PERMISSIONS;

const ADD_PERMISSIONS = [
    {
        id: 'b06f0d75-ce2f-4b4f-851b-7dcb2c7460aa',
        name: 'pass_primary_confirmation',
    },
];

const REMOVE_PERMISSIONS = [
    'finish_registration'
];

const ALL_PERMISSIONS = [
    ...FIRST_PERMISSIONS,
];

const ALL_ROLES = [
    ...FIRST_ROLES,
];

const ROLES_WITH_PERMISSIONS = [
    ['confirmed_email_and_phone_transporter', [
        'finish_registration',
    ]],
    ['confirmed_email_and_phone_holder', [
        'finish_registration',
    ]],
    ['confirmed_email_and_phone_individual_forwarder', [
        'finish_registration',
    ]],
    ['confirmed_email_and_phone_sole_proprietor_forwarder', [
        'finish_registration',
    ]],
];

const allRolesWithPermissionsToRemove = getRolesToPermissionsForDb(ALL_ROLES, ALL_PERMISSIONS, ROLES_WITH_PERMISSIONS);

const allPermissionsToRemove = FIRST_PERMISSIONS.filter(permission => REMOVE_PERMISSIONS.includes(permission.name));

exports.up = function(knex) {
    return Promise.all(allRolesWithPermissionsToRemove.map(({ role_id, permission_id }) => (
        knex('roles_to_permissions')
            .where('role_id', role_id)
            .andWhere('permission_id', permission_id)
            .del()
    )))
        .then(function () {
            return Promise.all(allPermissionsToRemove.map(permission => (
                knex('permissions')
                    .where('id', permission.id)
                    .del()
            )));
        })
        .then(function () {
            return knex.batchInsert('permissions', ADD_PERMISSIONS);
        });
};

exports.down = function(knex) {
    return knex.batchInsert('permissions', allPermissionsToRemove)
        .then(function () {
            return knex.batchInsert('roles_to_permissions', allRolesWithPermissionsToRemove);
        })
        .then(function () {
            return Promise.all(ADD_PERMISSIONS.map(() => (
                knex('users_to_permissions')
                    .whereIn('permission_id', ADD_PERMISSIONS.map(permission => permission.id))
                    .del()
            )));
        })
        .then(function () {
            return Promise.all(ADD_PERMISSIONS.map(permission => (
                knex('permissions')
                    .where('id', permission.id)
                    .del()
            )));
        });
};
