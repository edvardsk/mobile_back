
exports.up = function(knex) {
    return knex.schema.createTable('other_organizations', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('company_id').references('companies.id').notNull();
        table.string('identity_number', 12).notNull();
        table.string('name').notNull();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.unique(['company_id', 'identity_number']);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('other_organizations');
};
