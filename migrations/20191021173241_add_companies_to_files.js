
exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('companies_to_files', function(table) {
            table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
            table.uuid('company_id').references('companies.id').notNull();
            table.uuid('file_id').references('files.id').notNull();
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.unique(['company_id', 'file_id']);
        }),
        knex.schema.dropTable('users_to_files'),
    ]);
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.createTable('users_to_files', function(table) {
            table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
            table.uuid('user_id').references('users.id').notNull();
            table.uuid('file_id').references('files.id').notNull();
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.unique(['user_id', 'file_id']);
        }),
        knex.schema.dropTable('companies_to_files'),
    ]);
};
