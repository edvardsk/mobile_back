const CONTROL_ROLES = require('./20191023095323_insert_roles').ROLES;

const { getRolesToPermissionsForDb } = require('../app/formatters/system');

const PERMISSIONS = [
    {
        id: 'd703bdbc-bc5d-4386-8874-15fbcd6ff0e3',
        name: 'verify_deal_instance',
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
        'verify_deal_instance',
    ]],
    ['manager', [
        'verify_deal_instance',
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
