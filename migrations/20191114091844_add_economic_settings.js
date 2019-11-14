const DEFAULT_ECONOMIC_SETTINGS = {
    company_id: null,
    percent_from_transporter: 2,
    percent_from_holder: 2,
    percent_to_forwarder: 90,
};

exports.up = function(knex) {
    return knex.schema.createTable('economic_settings', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('company_id').references('companies.id').unique();
        table.decimal('percent_from_transporter', 4, 2).notNull();
        table.decimal('percent_from_holder', 4, 2).notNull();
        table.decimal('percent_to_forwarder', 4, 2).notNull();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
        .then(function () {
            return Promise.all([
                knex.raw('CREATE UNIQUE INDEX company_id_index ON economic_settings ((company_id IS NULL)) WHERE company_id IS NULL;'),
                knex.raw('ALTER TABLE economic_settings ADD CONSTRAINT percent_from_transporter_check CHECK (percent_from_transporter >= 0 AND percent_from_transporter < 100)'),
                knex.raw('ALTER TABLE economic_settings ADD CONSTRAINT percent_from_holder_check CHECK (percent_from_holder >= 0 AND percent_from_holder < 100)'),
                knex.raw('ALTER TABLE economic_settings ADD CONSTRAINT percent_to_forwarder_check CHECK (percent_to_forwarder >= 0 AND percent_to_forwarder <= 100)'),
                knex.raw('ALTER TABLE economic_settings ADD CONSTRAINT percent_sum CHECK (percent_from_transporter + percent_from_holder < 100)'),
            ]);
        })
        .then(function () {
            return knex.insert(DEFAULT_ECONOMIC_SETTINGS).into('economic_settings');
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('economic_settings');
};
