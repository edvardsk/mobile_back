
exports.up = function(knex) {
    return knex.schema.createTable('freezing_history', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('target_id').references('users.id').notNull();
        table.uuid('initiator_id').references('users.id').notNull();
        table.boolean('freezed').defaultTo(false).notNull();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('freezing_history');
};
