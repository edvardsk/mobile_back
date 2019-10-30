
exports.up = function(knex) {
    return knex.schema.alterTable('companies', function(table) {
        table.uuid('bank_country_id').references('countries.id');
        table.specificType('legal_city_coordinates', 'geography');
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('companies', function (table) {
        table.dropColumn('bank_country_id');
        table.dropColumn('legal_city_coordinates');
    });
};
