
exports.up = function(knex) {
    return knex.schema.alterTable('email_confirmation_hashes', function(table) {
        table.boolean('used').notNull().defaultTo(false);
        table.timestamp('expired_at');
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('email_confirmation_hashes', function (table) {
        table.dropColumn('used');
        table.dropColumn('expired_at');
    });
};
