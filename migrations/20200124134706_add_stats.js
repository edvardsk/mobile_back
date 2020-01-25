
exports.up = function(knex) {
    return knex.schema.createTable('stats', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.smallint('strength').notNull();
        table.integer('perception').notNull();
        table.integer('endurance').notNull();
        table.integer('intelligence').notNull();
        table.integer('agility').notNull();
        table.integer('luck').notNull();
        table.uuid('user_id').references('users.id').notNull().unique();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('stats');
};
