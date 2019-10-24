const { getRolesToPermissionsForDb } = require('../app/formatters/system');
const { ROLES } = require('./20191023095323_insert_roles');

const PERMISSIONS = [
    {
        id: 'b4726e53-242a-448d-8743-ee265e38d980',
        name: 'invite_manager'
    },
];

const ROLES_WITH_PERMISSIONS = [
    ['admin', [
        'invite_manager',
    ]],
];

const allRolesWithPermissions = getRolesToPermissionsForDb(ROLES, PERMISSIONS, ROLES_WITH_PERMISSIONS);

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
