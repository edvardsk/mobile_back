const { getRolesToPermissionsForDb } = require('../app/formatters/system');

exports.up = function(knex) {
    return knex.schema.createTable('roles_to_permissions', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('role_id').references('roles.id');
        table.uuid('permission_id').references('permissions.id');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.unique(['role_id', 'permission_id']);
    })
        .then(function () {
            return knex.batchInsert('roles_to_permissions', getRolesToPermissionsForDb());
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('roles_to_permissions');
};
