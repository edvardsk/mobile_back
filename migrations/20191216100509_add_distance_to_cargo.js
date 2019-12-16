
exports.up = function(knex) {
    return knex.schema.alterTable('cargos', function(table) {
        table.integer('distance');
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('cargos', function (table) {
        table.dropColumn('distance');
    });
};
