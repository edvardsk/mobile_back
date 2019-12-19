
exports.up = function(knex) {
    return knex.schema.alterTable('users', function(table) {
        table.string('passport_personal_id').unique();
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('users', function(table) {
        table.dropColumn('passport_personal_id');
    });
};
