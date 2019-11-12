const CONTROL_ROLES = require('./20191023095323_insert_roles').ROLES;

const { getRolesToPermissionsForDb } = require('../app/formatters/system');

const PERMISSIONS = [
    {
        id: '38c48dab-7088-4f86-914d-03a14ed4cdb0',
        name: 'read_companies',
    },
    {
        id: '22a0c126-83e9-422b-a7c4-4004c63bc29e',
        name: 'approve_company',
    },
];

const ALL_PERMISSIONS = [
    ...PERMISSIONS,
];

const ALL_ROLES = [
    ...CONTROL_ROLES,
];

const ROLES_WITH_PERMISSIONS = [
    ['admin', [
        'read_companies',
        'approve_company',
    ]],
    ['manager', [
        'read_companies',
        'approve_company',
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
