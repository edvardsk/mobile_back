
exports.up = function(knex) {
    return Promise.all([
        knex.schema.alterTable('drivers', function(table) {
            table.boolean('shadow').notNull().defaultTo(false);
        }),
        knex.schema.alterTable('cars', function(table) {
            table.boolean('shadow').notNull().defaultTo(false);
        }),
        knex.schema.alterTable('trailers', function(table) {
            table.boolean('shadow').notNull().defaultTo(false);
        })
    ]);
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.alterTable('drivers', function (table) {
            table.dropColumn('shadow');
        }),
        knex.schema.alterTable('cars', function (table) {
            table.dropColumn('shadow');
        }),
        knex.schema.alterTable('trailers', function (table) {
            table.dropColumn('shadow');
        }),
    ]);
};
