exports.up = function(knex) {
    return knex.schema.createTable('euro_countries', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('country_id').references('countries.id').notNull().unique();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('euro_countries');
};
