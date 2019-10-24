
exports.up = function(knex) {
    return knex.schema.createTable('invites', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('user_id').references('users.id').notNull();
        table.string('hash').notNull().unique();
        table.boolean('used').notNull().defaultTo(false);
        table.timestamp('expired_at').defaultTo(knex.fn.now());
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('invites');
};
