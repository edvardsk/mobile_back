
exports.up = function(knex) {
    return knex.schema.createTable('files_to_file_labels', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('file_id').references('files.id');
        table.uuid('label_id').references('file_labels.id');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.unique(['file_id', 'label_id']);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('files_to_file_labels');
};
