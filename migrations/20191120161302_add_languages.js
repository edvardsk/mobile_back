const RUSSIAN_LANGUAGE_ID = 'b08fd415-1bf7-430e-938a-f2cad339cf42';

const LANGUAGES = [
    {
        id: RUSSIAN_LANGUAGE_ID,
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
        })
        .then(function () {
            return knex.schema.alterTable('users', function(table) {
                table.uuid('language_id').defaultTo(RUSSIAN_LANGUAGE_ID).notNull().references('languages.id');
            });
        });
};

exports.down = function(knex) {
    return knex.schema.alterTable('users', function (table) {
        table.dropColumn('language_id');
    })
        .then(function () {
            return knex.schema.dropTable('languages');
        });
};
