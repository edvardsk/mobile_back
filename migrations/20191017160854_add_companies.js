
exports.up = function(knex) {
    return knex.schema.createTable('companies', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('user_id').references('users.id').unique();
        table.string('name').unique();
        table.text('description');
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('companies');
};
