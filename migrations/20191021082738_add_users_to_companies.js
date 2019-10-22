
exports.up = function(knex) {
    return knex.schema.createTable('users_to_companies', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('user_id').references('users.id').unique();
        table.uuid('company_id').references('companies.id');
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('users_to_companies');
};
