
exports.up = function(knex) {
    return knex.schema.alterTable('deal_cars', function(table) {
        table.dropUnique('car_vin');
        table.dropUnique('car_state_number');

    })
        .then(function () {
            return knex.schema.alterTable('deal_trailers', function(table) {
                table.dropUnique('trailer_vin');
                table.dropUnique('trailer_state_number');
            });
        });
};

exports.down = function(knex) {
    return knex.schema.alterTable('deal_cars', function(table) {
        table.unique('car_vin');
        table.unique('car_state_number');

    })
        .then(function () {
            return knex.schema.alterTable('deal_trailers', function(table) {
                table.unique('trailer_vin');
                table.unique('trailer_state_number');
            });
        });
};
