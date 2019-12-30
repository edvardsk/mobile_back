
exports.up = function(knex) {
    return knex.schema.createTable('deal_statuses_history_confirmations', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('deal_status_history_id').references('deal_history_statuses.id').unique().notNull();
        table.boolean('confirmed_by_transporter').notNull().defaultTo(false);
        table.boolean('confirmed_by_holder').notNull().defaultTo(false);
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('deal_statuses_history_confirmations');
};
