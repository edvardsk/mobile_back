
const LANGUAGES = [
    {
        name: 'Russian',
        code: 'ru',
    },
    {
        name: 'English',
        code: 'en',
    },
];

exports.up = function(knex) {
    return knex.schema.createTable('languages', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.string('name', 50).notNull().unique();
        table.string('code', 5).notNull().unique();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
        .then(function () {
            return knex.batchInsert('languages', LANGUAGES);
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('languages');
};
