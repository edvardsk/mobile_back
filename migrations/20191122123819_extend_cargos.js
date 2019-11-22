
exports.up = function(knex) {
    return knex.schema.alterTable('cargos', function(table) {
        table.boolean('deleted').notNull().defaultTo(false);
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('cargos', function (table) {
        table.dropColumn('deleted');
    });
};
