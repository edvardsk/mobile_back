
exports.up = function(knex) {
    return Promise.all([
        knex.schema.alterTable('deal_cars_to_files', function(table) {
            table.uuid('deal_id').notNull();
        }),
        knex.schema.alterTable('deal_trailers_to_files', function(table) {
            table.uuid('deal_id').notNull();
        }),
        knex.schema.alterTable('deal_drivers_to_files', function(table) {
            table.uuid('deal_id').notNull();
        })
    ]);
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.alterTable('deal_cars_to_files', function(table) {
            table.dropColumn('deal_id');
        }),
        knex.schema.alterTable('deal_trailers_to_files', function(table) {
            table.dropColumn('deal_id');
        }),
        knex.schema.alterTable('deal_drivers_to_files', function(table) {
            table.dropColumn('deal_id');
        }),
    ]);
};
