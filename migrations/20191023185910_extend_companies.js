
exports.up = function(knex) {
    return knex.schema.alterTable('companies', function(table) {
        table.string('insurance_policy_number');
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('companies', function (table) {
        table.dropColumn('insurance_policy_number');
    });
};
