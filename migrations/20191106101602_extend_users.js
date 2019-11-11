
exports.up = function(knex) {
    return knex.schema.alterTable('users', function(table) {
        table.boolean('freezed').defaultTo(false).notNull();
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('users', function (table) {
        table.dropColumn('freezed');
    });
};
