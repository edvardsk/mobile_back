
exports.up = function(knex) {
    return knex.schema.alterTable('cargos', function(table) {
        table.integer('distance').notNull().defaultTo(0);
    })
        .then(function () {
            return Promise.all([
                knex.raw('ALTER TABLE cargos ADD CONSTRAINT distance_check CHECK (distance >= 0)'),
            ]);
        });
};

exports.down = function(knex) {
    return Promise.all([
        knex.raw('ALTER TABLE cargos DROP CONSTRAINT distance_check;'),
    ])
        .then(function () {
            return knex.schema.alterTable('cargos', function (table) {
                table.dropColumn('distance');
            });
        });
};
