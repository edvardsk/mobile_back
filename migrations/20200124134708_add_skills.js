
exports.up = function(knex) {
    return knex.schema.createTable('skills', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.integer('small_gun').notNull();
        table.integer('big_gun').notNull();
        table.integer('energy_weapon').notNull();
        table.integer('unarmed').notNull();
        table.integer('melee_weapon').notNull();
        table.integer('throwing').notNull();
        table.integer('doctor').notNull();
        table.integer('science').notNull();
        table.uuid('user_id').references('users.id').notNull().unique();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('skills');
};
