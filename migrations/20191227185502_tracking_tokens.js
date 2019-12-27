
exports.up = function(knex) {
    return knex.schema.createTable('tracking_socket_hashes', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('user_id').references('users.id');
        table.string('deal_id').references('deals.id');
        table.string('hash').notNull().unique();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('expired_at');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('tracking_socket_hashes');
};
