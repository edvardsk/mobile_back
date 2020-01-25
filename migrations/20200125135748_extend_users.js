exports.up = function(knex) {
    return knex.schema.alterTable('users', function(table) {
        table.uuid('skills_id').references('skills.id').unique();
        table.uuid('stats_id').references('stats.id').unique();
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('users', function (table) {
        table.dropColumn('skills_id');
        table.dropColumn('stats_id');
    });
};
