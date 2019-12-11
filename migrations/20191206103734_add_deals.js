
exports.up = function(knex) {
    return knex.schema.createTable('deals', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('cargo_id').references('cargos.id').notNull();
        table.uuid('transporter_company_id').references('companies.id').notNull();
        table.uuid('driver_id').references('drivers.id').notNull();
        table.uuid('car_id').references('cars.id').notNull();
        table.uuid('trailer_id').references('trailers.id');
        table.uuid('pay_currency_id').references('currencies.id').notNull();
        table.decimal('pay_value', 14, 2).notNull();
        table.boolean('approved').notNull().defaultTo(false);
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
        .then(function () {
            return knex.schema.createTable('deal_history_statuses', function(table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
                table.uuid('deal_id').references('deals.id').notNull();
                table.uuid('initiator_id').references('users.id').notNull();
                table.uuid('deal_status_id').references('deal_statuses.id').notNull();
                table.timestamp('created_at').defaultTo(knex.fn.now());
            });
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('deal_history_statuses')
        .then(function () {
            return knex.schema.dropTable('deals');
        });
};
