
exports.up = function(knex) {
    return knex.schema.createTable('deal_problems', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('deal_status_history_id').references('deal_history_statuses.id').notNull();
        table.uuid('initiator_id').references('users.id');
        table.text('description').notNull();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('deal_problems');
};
