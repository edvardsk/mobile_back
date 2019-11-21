exports.up = function(knex) {
    return knex.schema.createTable('points', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.string('point', 50).notNull().unique();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
        .then(function () {
            return knex.schema.createTable('point_translations', function(table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
                table.uuid('point_id').references('points.id').notNull();
                table.uuid('language_id').references('languages.id').notNull();
                table.string('value').notNull();
                table.timestamp('created_at').defaultTo(knex.fn.now());
            });
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('point_translations')
        .then(function () {
            return knex.schema.dropTable('points');
        });
};
