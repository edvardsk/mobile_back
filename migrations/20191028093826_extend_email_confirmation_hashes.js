
exports.up = function(knex) {
    return knex.schema.alterTable('email_confirmation_hashes', function(table) {
        table.uuid('initiator_id').references('users.id');
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('email_confirmation_hashes', function (table) {
        table.dropColumn('initiator_id');
    });
};
