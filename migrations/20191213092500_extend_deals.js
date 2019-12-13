
exports.up = function(knex) {
    return knex.schema.alterTable('deals', function(table) {
        table.string('name');
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('deals', function(table) {
        table.dropColumn('name');
    });
};
