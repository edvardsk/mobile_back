
exports.up = function(knex) {
    return knex.schema.alterTable('companies', function(table) {
        table.string('legal_city_name');
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('companies', function (table) {
        table.dropColumn('legal_city_name');
    });
};
