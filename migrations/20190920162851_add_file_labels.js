const { getFileLabelsForDb } = require('../app/formatters/system');

exports.up = function(knex) {
    return knex.schema.createTable('file_labels', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.string('name').unique().notNull();
        table.text('description');
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
        .then(function () {
            return knex.batchInsert('file_labels', getFileLabelsForDb());
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('file_labels');
};
