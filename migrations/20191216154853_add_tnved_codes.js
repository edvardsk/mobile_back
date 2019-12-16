const TNVED_CODES = [];

for (let code = 1; code <= 97; code++){
    TNVED_CODES.push({ code });
}

exports.up = function(knex) {
    return knex.schema.createTable('tnved_codes', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.integer('code').notNull();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
        .then(function () {
            return knex.schema.createTable('tnved_codes_keywords', function(table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
                table.uuid('tnved_code_id').references('tnved_codes.id').notNull();
                table.uuid('language_id').references('languages.id').notNull();
                table.string('value').notNull();
                table.timestamp('created_at').defaultTo(knex.fn.now());
                table.unique(['tnved_code_id', 'language_id', 'value']);
            });
        })
        .then(function () {
            return knex.batchInsert('tnved_codes', TNVED_CODES);
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('tnved_codes_keywords')
        .then(function () {
            return knex.schema.dropTable('tnved_codes');
        });
};
