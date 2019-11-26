exports.up = function(knex) {
    return knex.schema.createTable('exchange_rates', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('country_id').references('countries.id').notNull();
        table.uuid('currency_id').references('currencies.id').notNull();
        table.decimal('value', 10, 4).notNull();
        table.integer('nominal').notNull();
        table.date('actual_date').notNull();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.unique(['country_id', 'currency_id']);
    })
        .then(function () {
            return Promise.all([
                knex.raw('ALTER TABLE exchange_rates ADD CONSTRAINT value_check CHECK (value > 0)'),
                knex.raw('ALTER TABLE exchange_rates ADD CONSTRAINT nominal_check CHECK (nominal > 0)'),
            ]);
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('exchange_rates');
};
