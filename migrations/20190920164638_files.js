
exports.up = function(knex) {
    return knex.schema.createTable('files', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.string('name').notNull();
        table.text('url').notNull();
        table.text('description');
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('files');
};
