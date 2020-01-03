const SUB_STATUSES = [
    'expired',
    'damaged',
    'cancelled',
].map(name => ({
    name
}));

exports.up = function(knex) {
    return knex.schema.dropTable('deal_sub_statuses_history')
        .then(function () {
            return knex.schema.dropTable('deal_sub_statuses');
        });
};

exports.down = function(knex) {
    return knex.schema.createTable('deal_sub_statuses', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.string('name').notNull().unique();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
        .then(function () {
            return knex.batchInsert('deal_sub_statuses', SUB_STATUSES);
        })
        .then(function () {
            return knex.schema.createTable('deal_sub_statuses_history', function(table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
                table.uuid('deal_status_history_id').references('deal_history_statuses.id').notNull();
                table.uuid('deal_sub_status_id').references('deal_sub_statuses.id').notNull();
                table.uuid('initiator_id').references('users.id');
                table.text('description');
                table.timestamp('created_at').defaultTo(knex.fn.now());
            });
        });
};
