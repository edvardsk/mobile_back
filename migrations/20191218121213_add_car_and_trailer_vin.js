
exports.up = function(knex) {
    return Promise.all([
        knex.schema.alterTable('cars', function(table) {
            table.string('car_vin').defaultTo(knex.raw('uuid_generate_v4()')).unique();
        }),
        knex.schema.alterTable('trailers', function(table) {
            table.string('trailer_vin').defaultTo(knex.raw('uuid_generate_v4()')).unique();
        })
    ]);
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.alterTable('cars', function(table) {
            table.dropColumn('car_vin');
        }),
        knex.schema.alterTable('trailers', function(table) {
            table.dropColumn('trailer_vin');
        })
    ]);
};
