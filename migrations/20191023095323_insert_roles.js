const FIRST_PERMISSIONS = require('./20191017144540_add_permissions').PERMISSIONS;
const { getRolesToPermissionsForDb } = require('../app/formatters/system');


const ROLES = [
    {
        id: 'faee972d-501f-4216-a072-bec9f9777802',
        name: 'admin',
    },
    {
        id: 'e8d35b93-954b-4649-b162-6f1deeda975e',
        name: 'manager',
    },
];

const PERMISSIONS = [
    {
        id: '731d9ff3-d72f-4d29-8a25-ce98a1184eb4',
        name: 'accept_registration'
    },
    {
        id: 'e805f0fe-b734-4b1e-a3f6-64a7e1a445d2',
        name: 'expect_registration_confirmation',
    },
];

const ALL_PERMISSIONS = [
    ...FIRST_PERMISSIONS,
    ...PERMISSIONS,
];

const ROLES_WITH_PERMISSIONS = [
    ['admin', [
        'authorization',
        'reset_password',
        'accept_registration',
    ]],
    ['manager', [
        'authorization',
        'reset_password',
        'accept_registration',
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
