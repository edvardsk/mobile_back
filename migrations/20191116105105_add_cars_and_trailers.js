
exports.up = function(knex) {
    return knex.schema.createTable('cars', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('company_id').references('companies.id').notNull();
        table.string('mark').notNull();
        table.string('model').notNull();
        table.string('state_number').notNull();
        table.integer('made_year_at').notNull();
        table.string('car_type').notNull();
        table.specificType('loading_methods', 'text[]');
        table.uuid('vehicle_type_id').references('vehicle_types.id');
        table.uuid('danger_class_id').references('danger_classes.id');
        table.float('width');
        table.float('height');
        table.float('length');
        table.float('weight');
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
        .then(function () {
            return knex.schema.createTable('trailers', function(table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
                table.uuid('car_id').references('cars.id').notNull().unique();
                table.string('mark').notNull();
                table.string('model').notNull();
                table.string('state_number').notNull();
                table.integer('made_year_at').notNull();
                table.specificType('loading_methods', 'text[]');
                table.uuid('vehicle_type_id').references('vehicle_types.id');
                table.uuid('danger_class_id').references('danger_classes.id');
                table.float('width');
                table.float('height');
                table.float('length');
                table.float('weight');
                table.timestamp('created_at').defaultTo(knex.fn.now());
            });
        })
        .then(function () {
            return knex.schema.createTable('cars_to_files', function(table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
                table.uuid('car_id').references('cars.id').notNull();
                table.uuid('file_id').references('files.id').notNull();
                table.timestamp('created_at').defaultTo(knex.fn.now());
                table.unique(['car_id', 'file_id']);
            });
        })
        .then(function () {
            return knex.schema.createTable('trailers_to_files', function(table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
                table.uuid('trailer_id').references('trailers.id').notNull();
                table.uuid('file_id').references('files.id').notNull();
                table.timestamp('created_at').defaultTo(knex.fn.now());
                table.unique(['trailer_id', 'file_id']);
            });
        })
        .then(function () {
            return Promise.all([
                knex.raw('ALTER TABLE cars ADD CONSTRAINT made_year_at_check CHECK (made_year_at >= 1900 AND made_year_at <= 3000)'),
                knex.raw('ALTER TABLE trailers ADD CONSTRAINT made_year_at_check CHECK (made_year_at >= 1900 AND made_year_at <= 3000)'),
            ]);
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('trailers_to_files')
        .then(function () {
            return knex.schema.dropTable('cars_to_files');
        })
        .then(function () {
            return knex.schema.dropTable('trailers');
        })
        .then(function () {
            return knex.schema.dropTable('cars');
        });
};
