
exports.up = function(knex) {
    return knex.schema.alterTable('cargos', function(table) {
        table.integer('count').notNull().defaultTo(1);
    })
        .then(function () {
            return knex.raw('ALTER TABLE cargos ADD CONSTRAINT count_check CHECK (count > 0)');
        });
};

exports.down = function(knex) {
    return knex.raw('ALTER TABLE cargos DROP CONSTRAINT count_check;')
        .then(function () {
            return knex.schema.alterTable('cargos', function (table) {
                table.dropColumn('count');
            });
        });
};
