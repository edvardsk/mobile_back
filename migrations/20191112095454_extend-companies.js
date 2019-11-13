
exports.up = function(knex) {
    return knex.schema.alterTable('companies', function(table) {
        table.uuid('head_role_id').references('roles.id');
        table.boolean('primary_confirmed').defaultTo(false).notNull();
        table.boolean('editing_confirmed').defaultTo(false).notNull();
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('companies', function (table) {
        table.dropColumn('head_role_id');
        table.dropColumn('primary_confirmed');
        table.dropColumn('editing_confirmed');
    });
};
