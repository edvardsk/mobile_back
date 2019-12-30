
exports.up = function(knex) {
    return knex.schema.alterTable('deals', function(table) {
        table.string('departure_customs_country');
        table.string('departure_customs_person_full_name');
        table.string('departure_customs_person_full_phone_number');

        table.string('arrival_customs_country');
        table.string('arrival_customs_person_full_name');
        table.string('arrival_customs_person_full_phone_number');

        table.uuid('tnved_code_id').references('tnved_codes.id');

        table.uuid('invoice_currency_id').references('currencies.id');
        table.decimal('invoice_price', 14, 2);

        table.integer('standard_loading_time_hours');
        table.text('special_requirements');
    })
        .then(function () {
            return Promise.all([
                knex.raw('ALTER TABLE deals ADD CONSTRAINT invoice_price_check CHECK (invoice_price > 0)'),
                knex.raw('ALTER TABLE deals ADD CONSTRAINT standard_loading_time_hours_check CHECK (standard_loading_time_hours > 0)'),
            ]);
        });
};

exports.down = function(knex) {
    return Promise.all([
        knex.raw('ALTER TABLE deals DROP CONSTRAINT invoice_price_check'),
        knex.raw('ALTER TABLE deals DROP CONSTRAINT standard_loading_time_hours_check')
    ])
        .then(function () {
            return knex.schema.alterTable('deals', function(table) {
                table.dropColumn('departure_customs_country');
                table.dropColumn('departure_customs_person_full_name');
                table.dropColumn('departure_customs_person_full_phone_number');

                table.dropColumn('arrival_customs_country');
                table.dropColumn('arrival_customs_person_full_name');
                table.dropColumn('arrival_customs_person_full_phone_number');

                table.dropColumn('tnved_code_id');

                table.dropColumn('invoice_currency_id');
                table.dropColumn('invoice_price');

                table.dropColumn('standard_loading_time_hours');
                table.dropColumn('special_requirements');
            });
        });
};
