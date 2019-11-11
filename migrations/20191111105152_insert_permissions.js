const CONTROL_ROLES = require('./20191023095323_insert_roles').ROLES;

const { getRolesToPermissionsForDb } = require('../app/formatters/system');

const PERMISSIONS = [
    {
        id: '61ca244d-8581-4b4d-8ea9-7da9d54f8dd1',
        name: 'modify_conditions_and_terms',
    },
    {
        id: '9793a97d-404b-471e-9e02-5884781d4c69',
        name: 'read_conditions_and_terms',
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
        'read_conditions_and_terms',
        'modify_conditions_and_terms',
    ]],
    ['manager', [
        'read_conditions_and_terms',
        'modify_conditions_and_terms',
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
