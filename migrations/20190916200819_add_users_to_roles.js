
exports.up = function(knex) {
    return knex.schema.createTable('users_to_roles', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('user_id').references('users.id');
        table.uuid('role_id').references('roles.id');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.unique(['user_id', 'role_id']);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('users_to_roles');
};
