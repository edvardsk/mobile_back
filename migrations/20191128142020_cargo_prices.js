
exports.up = function(knex) {
    return knex.schema.createTable('cargo_prices', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('cargo_id').references('cargos.id').notNull();
        table.uuid('currency_id').references('currencies.id').notNull();
        table.uuid('next_currency_id').references('currencies.id');
        table.decimal('price', 14, 2).notNull().defaultTo(1);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.unique(['cargo_id', 'currency_id']);
        table.unique(['cargo_id', 'next_currency_id']);
    })
        .then(function () {
            return knex.raw('ALTER TABLE cargos DROP CONSTRAINT price_check;');
        })
        .then(function () {
            return knex.schema.alterTable('cargos', function (table) {
                table.dropColumn('currency_id');
                table.dropColumn('price');
            });
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('cargo_prices')
        .then(function () {
            return knex.schema.alterTable('cargos', function(table) {
                table.uuid('currency_id').references('currencies.id').notNull().defaultTo('2312c3e3-6e08-44fb-8af7-1a942eaf98e1');
                table.decimal('price', 14, 2).notNull().defaultTo(1);
            });
        })
        .then(function () {
            return knex.raw('ALTER TABLE cargos ADD CONSTRAINT price_check CHECK (price > 0)');
        });
};
