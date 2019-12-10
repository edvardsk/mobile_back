
exports.up = function(knex) {
    return knex.schema.alterTable('drivers', function(table) {
        table.boolean('shadow').notNull().defaultTo(false);
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('drivers', function (table) {
        table.dropColumn('shadow');
    });
};
