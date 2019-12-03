
exports.up = function(knex) {
    return knex.schema.table('cars', function(table) {
        table.renameColumn('car_weight', 'car_carrying_capacity');
    })
        .then(function() {
            return knex.schema.table('trailers', function(table) {
                table.renameColumn('trailer_weight', 'trailer_carrying_capacity');
            });
        });
};

exports.down = function(knex) {
    return knex.schema.table('cars', function(table) {
        table.renameColumn('car_carrying_capacity', 'car_weight');
    })
        .then(function() {
            return knex.schema.table('trailers', function(table) {
                table.renameColumn('trailer_carrying_capacity', 'trailer_weight');
            });
        });
};
