
exports.up = function(knex) {
    return knex.schema.createTable('email_confirmation_hashes', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('user_id').references('users.id');
        table.string('hash').notNull().unique();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('email_confirmation_hashes');
};
