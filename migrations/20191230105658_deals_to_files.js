
exports.up = function(knex) {
    return knex.schema.createTable('deals_to_files', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('deal_id').references('deals.id').notNull();
        table.uuid('file_id').references('files.id').notNull();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.unique(['deal_id', 'file_id']);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('deals_to_files');
};
