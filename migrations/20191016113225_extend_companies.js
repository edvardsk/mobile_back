
exports.up = function(knex) {
    return knex.schema.alterTable('companies', function(table) {
        table.string('ownership_type', 50);
        table.string('website');
        table.timestamp('registered_at').notNull();
        table.uuid('country_id').references('countries.id').notNull();
        table.string('identity_number', 12).unique().notNull();
        table.dropColumn('description');
        table.dropColumn('user_id');
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('companies', function (table) {
        table.dropColumn('ownership_type');
        table.dropColumn('website');
        table.dropColumn('registered_at');
        table.dropColumn('country_id');
        table.dropColumn('identity_number');
        table.text('description');
        table.uuid('user_id').references('users.id').unique();
    });
};
