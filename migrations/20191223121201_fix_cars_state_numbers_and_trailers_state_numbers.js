
exports.up = function(knex) {
    return knex.schema.alterTable('cars_state_numbers', function(table) {
        table.dropUnique(['number', 'is_active']);
    })
        .then(function () {
            return knex.schema.alterTable('trailers_state_numbers', function(table) {
                table.dropUnique(['number', 'is_active']);
            });
        });
};

exports.down = function(knex) {
    return knex.schema.alterTable('cars_state_numbers', function(table) {
        table.unique(['number', 'is_active']);
    })
        .then(function () {
            return knex.schema.alterTable('trailers_state_numbers', function(table) {
                table.unique(['number', 'is_active']);
            });
        });
};
