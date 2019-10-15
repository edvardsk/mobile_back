exports.up = function(knex) {
    return knex.schema.createTable('users_to_permissions', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('user_id').references('users.id');
        table.uuid('permission_id').references('permissions.id');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.unique(['user_id', 'permission_id']);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('users_to_permissions');
};
