const CONTROL_ROLES = require('./20191023095323_insert_roles').ROLES;

const { getRolesToPermissionsForDb } = require('../app/formatters/system');

const PERMISSIONS = [
    {
        id: '3654b57d-0ea5-42e5-b08e-bcc7c5b70ff1',
        name: 'edit_default_economic_settings',
    },
    {
        id: '1047e671-f608-46f6-ad71-4f79accaed91',
        name: 'read_default_economic_settings',
    },
    {
        id: 'a6d93082-5ab4-4756-9bd5-0ee845c824f8',
        name: 'crud_companies_economic_settings',
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
        'edit_default_economic_settings',
        'read_default_economic_settings',
        'crud_companies_economic_settings',
    ]],
    ['manager', [
        'read_default_economic_settings',
        'crud_companies_economic_settings',
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
