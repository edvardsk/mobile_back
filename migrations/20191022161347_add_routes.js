
exports.up = function(knex) {
    return knex.schema.createTable('routes', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('company_id').references('companies.id').notNull();
        table.specificType('coordinates_from', 'geography').notNull();
        table.specificType('coordinates_to', 'geography').notNull();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('routes');
};
