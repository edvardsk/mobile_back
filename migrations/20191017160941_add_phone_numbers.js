
const PHONE_PREFIXES = [
    {
        prefix: 'BY',
        code: 375,
    },
    {
        prefix: 'RU',
        code: 7,
    },
    {
        prefix: 'UA',
        code: 380,
    }
];

exports.up = function(knex) {
    return knex.schema.createTable('phone_prefixes', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.string('prefix', 2).notNull();
        table.integer('code').notNull();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
        .then(function () {
            return knex.schema.createTable('phone_numbers', function(table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
                table.uuid('user_id').references('users.id').unique();
                table.uuid('phone_prefix_id').references('phone_prefixes.id').notNull();
                table.string('number', 10).notNull();
                table.timestamp('created_at').defaultTo(knex.fn.now());
                table.unique(['phone_prefix_id', 'number']);
            });
        })
        .then(function () {
            return knex.batchInsert('phone_prefixes', PHONE_PREFIXES);
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('phone_numbers')
        .then(function () {
            return knex.schema.dropTable('phone_prefixes');
        });
};
