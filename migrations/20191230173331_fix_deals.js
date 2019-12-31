
exports.up = function(knex) {
    return knex.schema.alterTable('deals', function(table) {
        table.dropColumn('tnved_code');
    })
        .then(function () {
            return knex.schema.alterTable('deals', function(table) {
                table.string('tnved_code');
            });
        });
};

exports.down = function(knex) {
    return knex.schema.alterTable('deals', function(table) {
        table.dropColumn('tnved_code');
    })
        .then(function () {
            return knex.schema.alterTable('deals', function(table) {
                table.uuid('tnved_code');
            });
        });
};
