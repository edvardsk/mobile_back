
exports.up = function(knex) {
    return knex.schema.createTable('car_points', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('deal_id').references('deals.id');
        table.uuid('car_id').references('cars.id').notNull();
        table.uuid('trailer_id').references('trailers.id');
        table.specificType('coordinates', 'geography').notNull();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
        .then(function() {
            return knex.schema.createTable('car_latest_points', function(table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
                table.uuid('deal_id').references('deals.id');
                table.uuid('car_id').references('cars.id').notNull();
                table.uuid('trailer_id').references('trailers.id');
                table.specificType('coordinates', 'geography').notNull();
                table.timestamp('availability_time').defaultTo(knex.fn.now());
            });
        })
        .then(function() {
            return knex.select(
                'cars.id as car_id',
                'trailers.id as trailer_id',
                'companies.legal_city_coordinates as coordinates'
            )
                .from('cars')
                .leftOuterJoin('trailers', 'cars.id', 'trailers.car_id')
                .leftOuterJoin('companies', 'cars.company_id', 'companies.id');
        })
        .then(function(result) {
            return Promise.all([
                knex('car_points').insert(result),
                knex('car_latest_points').insert(result),
            ]);
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('car_points')
        .then(function() {
            return knex.schema.dropTable('car_latest_points');
        });
};
