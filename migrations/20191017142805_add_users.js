
exports.up = function(knex) {
    return knex.schema.createTable('users', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.string('email').unique();
        table.string('full_name').notNull();
        table.string('password').notNull();
        table.string('key').notNull();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('users');
};
