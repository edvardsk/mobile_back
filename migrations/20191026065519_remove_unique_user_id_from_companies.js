
exports.up = function(knex) {
    return knex.schema.alterTable('users_to_companies', function(table) {
        table.dropUnique('user_id');
        table.unique(['user_id', 'company_id']);
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('users_to_companies', function (table) {
        table.unique('user_id');
        table.dropUnique(['user_id', 'company_id']);
    });
};
