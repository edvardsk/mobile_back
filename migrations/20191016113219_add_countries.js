
const COUNTRIES = ['belarus', 'russia', 'ukraine'];

exports.up = function(knex) {
    return knex.schema.createTable('countries', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.string('name', 56).notNull();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
        .then(function () {
            return knex.batchInsert('countries', COUNTRIES.map(name => ({ name })));
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('countries');
};
