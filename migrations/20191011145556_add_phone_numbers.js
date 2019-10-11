
exports.up = function(knex) {
    return knex.schema.createTable('phone_numbers', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('user_id').references('users.id').unique();
        table.string('number', 10).notNull();
        table.string('prefix', 2).notNull();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('phone_numbers');
};
