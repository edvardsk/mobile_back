
exports.up = function(knex) {
    return knex.schema.alterTable('phone_numbers', function(table) {
        table.unique(['phone_prefix_id', 'number']);
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('phone_numbers', function (table) {
        table.dropUnique(['phone_prefix_id', 'number']);
    });
};
