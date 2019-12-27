
exports.up = function(knex) {
    return Promise.all([
        knex.schema.alterTable('deals', function(table) {
            table.dropForeign('driver_id', 'deals_driver_id_foreign');
            table.uuid('driver_id').nullable().alter();
        }),
    ]);
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.alterTable('deals', function (table) {
            table.uuid('driver_id').references('drivers.id').notNull().alter();
        }),
    ]);
};
