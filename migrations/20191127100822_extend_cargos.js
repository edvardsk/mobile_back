
exports.up = function(knex) {
    return knex.schema.alterTable('cargos', function(table) {
        table.uuid('currency_id').references('currencies.id').notNull().defaultTo('2312c3e3-6e08-44fb-8af7-1a942eaf98e1');
        table.decimal('price', 14, 2).notNull().defaultTo(1);
    })
        .then(function () {
            return knex.raw('ALTER TABLE cargos ADD CONSTRAINT price_check CHECK (price > 0)');
        });
};

exports.down = function(knex) {
    return knex.raw('ALTER TABLE cargos DROP CONSTRAINT price_check;')
        .then(function () {
            return knex.schema.alterTable('cargos', function (table) {
                table.dropColumn('currency_id');
                table.dropColumn('price');
            });
        });
};
