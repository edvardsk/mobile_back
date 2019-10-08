const { getPermissionsForDb } = require('../app/formatters/system');

exports.up = function(knex) {
    return knex.schema.createTable('permissions', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.string('name').unique().notNull();
        table.text('description');
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
        .then(function () {
            return knex.batchInsert('permissions', getPermissionsForDb());
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('permissions');
};
