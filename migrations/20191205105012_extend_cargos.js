
exports.up = function(knex) {
    return knex.schema.alterTable('cargos', function(table) {
        table.integer('count').notNull().defaultTo(1);
        table.integer('free_count').notNull().defaultTo(1);
    })
        .then(function () {
            return Promise.all([
                knex.raw('ALTER TABLE cargos ADD CONSTRAINT count_check CHECK (count > 0)'),
                knex.raw('ALTER TABLE cargos ADD CONSTRAINT free_count_check CHECK (free_count > 0)'),
            ]);
        });
};

exports.down = function(knex) {
    return Promise.all([
        knex.raw('ALTER TABLE cargos DROP CONSTRAINT count_check;'),
        knex.raw('ALTER TABLE cargos DROP CONSTRAINT free_count_check;'),
    ])
        .then(function () {
            return knex.schema.alterTable('cargos', function (table) {
                table.dropColumn('count');
                table.dropColumn('free_count');
            });
        });
};
