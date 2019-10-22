
exports.up = function(knex) {
    return knex.schema.alterTable('users', function(table) {
        table.string('passport_number', 19);
        table.string('passport_issuing_authority');
        table.timestamp('passport_created_at');
        table.timestamp('passport_expired_at');
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('users', function (table) {
        table.dropColumn('passport_number');
        table.dropColumn('passport_issuing_authority');
        table.dropColumn('passport_created_at');
        table.dropColumn('passport_expired_at');
    });
};
