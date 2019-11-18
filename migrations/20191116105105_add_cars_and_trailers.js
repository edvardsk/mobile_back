
exports.up = function(knex) {
    return knex.schema.createTable('cars', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('company_id').references('companies.id').notNull();
        table.string('car_mark').notNull();
        table.string('car_model').notNull();
        table.string('car_state_number').notNull().unique();
        table.integer('car_made_year_at').notNull();
        table.string('car_type').notNull();
        table.specificType('car_loading_methods', 'text[]');
        table.uuid('car_vehicle_type_id').references('vehicle_types.id');
        table.uuid('car_danger_class_id').references('danger_classes.id');
        table.decimal('car_width', 10, 2);
        table.decimal('car_height', 10, 2);
        table.decimal('car_length', 10, 2);
        table.decimal('car_weight', 10, 2);
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
        .then(function () {
            return knex.schema.createTable('trailers', function(table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
                table.uuid('car_id').references('cars.id').notNull().unique();
                table.string('trailer_mark').notNull();
                table.string('trailer_model').notNull();
                table.string('trailer_state_number').notNull().unique();
                table.integer('trailer_made_year_at').notNull();
                table.specificType('trailer_loading_methods', 'text[]');
                table.uuid('trailer_vehicle_type_id').references('vehicle_types.id');
                table.uuid('trailer_danger_class_id').references('danger_classes.id');
                table.decimal('trailer_width', 10, 2);
                table.decimal('trailer_height', 10, 2);
                table.decimal('trailer_length', 10, 2);
                table.decimal('trailer_weight', 10, 2);
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
                knex.raw('ALTER TABLE cars ADD CONSTRAINT car_made_year_at_check CHECK (car_made_year_at >= 1900 AND car_made_year_at <= 3000)'),
                knex.raw('ALTER TABLE trailers ADD CONSTRAINT trailer_made_year_at_check CHECK (trailer_made_year_at >= 1900 AND trailer_made_year_at <= 3000)'),
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
