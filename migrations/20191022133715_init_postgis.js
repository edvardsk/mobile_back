
exports.up = function(knex) {
    return knex.raw('create extension if not exists "postgis"');
};

exports.down = function(knex) {
    return knex.raw('drop extension if exists "postgis"');
};
