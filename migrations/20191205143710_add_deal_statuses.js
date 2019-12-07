const STATUSES = [
    'created',
].map(name => ({
    name
}));

exports.up = function(knex) {
    return knex.schema.createTable('deal_statuses', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.string('name').notNull();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
        .then(function () {
            return knex.batchInsert('deal_statuses', STATUSES);
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('deal_statuses');
};
