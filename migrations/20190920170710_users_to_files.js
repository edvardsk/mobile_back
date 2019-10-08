
exports.up = function(knex) {
    return knex.schema.createTable('users_to_files', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('user_id').references('users.id');
        table.uuid('file_id').references('files.id');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.unique(['user_id', 'file_id']);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('users_to_files');
};
