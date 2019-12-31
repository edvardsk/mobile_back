
exports.up = function(knex) {
    return knex.schema.createTable('deal_files', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.string('name').notNull();
        table.text('url').notNull();
        table.specificType('labels', 'text[]').notNull();
        table.date('valid_date_from');
        table.date('valid_date_to');
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
        .then(function () {
            return knex.schema.createTable('deals_to_deal_files', function(table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
                table.uuid('deal_id').references('deals.id').notNull();
                table.uuid('deal_file_id').references('deal_files.id').notNull();
                table.timestamp('created_at').defaultTo(knex.fn.now());
                table.unique(['deal_id', 'deal_file_id']);
            });
        })
        .then(function () {
            return knex.schema.createTable('deal_cars', function(table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
                table.uuid('car_id').references('cars.id').notNull();
                table.string('car_vin').unique().notNull();
                table.string('car_state_number').unique().notNull();
                table.string('car_mark').notNull();
                table.string('car_model').notNull();
                table.integer('car_made_year_at').notNull();
                table.string('car_type').notNull();
                table.specificType('car_loading_methods', 'text[]');
                table.uuid('car_vehicle_type_id').references('vehicle_types.id');
                table.uuid('car_danger_class_id').references('danger_classes.id');
                table.decimal('car_width', 10, 2);
                table.decimal('car_height', 10, 2);
                table.decimal('car_length', 10, 2);
                table.decimal('car_carrying_capacity', 10, 2);
                table.timestamp('created_at').defaultTo(knex.fn.now());
            });
        })
        .then(function () {
            return knex.schema.createTable('deal_cars_to_files', function(table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
                table.uuid('deal_car_id').references('deal_cars.id').notNull();
                table.uuid('deal_file_id').references('deal_files.id').notNull();
                table.timestamp('created_at').defaultTo(knex.fn.now());
                table.unique(['deal_car_id', 'deal_file_id']);
            });
        })
        .then(function () {
            return knex.schema.createTable('deal_trailers', function(table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
                table.uuid('trailer_id').references('trailers.id').notNull();
                table.string('trailer_vin').unique().notNull();
                table.string('trailer_state_number').unique().notNull();
                table.string('trailer_mark').notNull();
                table.string('trailer_model').notNull();
                table.integer('trailer_made_year_at').notNull();
                table.specificType('trailer_loading_methods', 'text[]').notNull();
                table.uuid('trailer_vehicle_type_id').references('vehicle_types.id').notNull();
                table.uuid('trailer_danger_class_id').references('danger_classes.id').notNull();
                table.decimal('trailer_width', 10, 2).notNull();
                table.decimal('trailer_height', 10, 2).notNull();
                table.decimal('trailer_length', 10, 2).notNull();
                table.decimal('trailer_carrying_capacity', 10, 2).notNull();
                table.timestamp('created_at').defaultTo(knex.fn.now());
            });
        })
        .then(function () {
            return knex.schema.createTable('deal_trailers_to_files', function(table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
                table.uuid('deal_trailer_id').references('deal_trailers.id').notNull();
                table.uuid('deal_file_id').references('deal_files.id').notNull();
                table.timestamp('created_at').defaultTo(knex.fn.now());
                table.unique(['deal_trailer_id', 'deal_file_id']);
            });
        })
        .then(function () {
            return knex.schema.createTable('deal_drivers', function(table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
                table.uuid('driver_id').references('drivers.id').notNull();
                table.string('email').notNull();
                table.string('full_name').notNull();
                table.uuid('phone_prefix_id').references('phone_prefixes.id').notNull();
                table.string('number', 10).notNull();
                table.timestamp('driver_licence_registered_at').notNull();
                table.timestamp('driver_licence_expired_at').notNull();
                table.timestamp('created_at').defaultTo(knex.fn.now());
                table.string('passport_number').notNull();
                table.string('passport_personal_id').notNull();
                table.string('passport_issuing_authority').notNull();
                table.date('passport_created_at').notNull();
                table.date('passport_expired_at').notNull();
            });
        })
        .then(function () {
            return knex.schema.createTable('deal_drivers_to_files', function(table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
                table.uuid('deal_driver_id').references('deal_drivers.id').notNull();
                table.uuid('deal_file_id').references('deal_files.id').notNull();
                table.timestamp('created_at').defaultTo(knex.fn.now());
                table.unique(['deal_driver_id', 'deal_file_id']);
            });
        })
        .then(function () {
            return knex.schema.alterTable('deals', function(table) {
                table.uuid('deal_driver_id').references('deal_drivers.id');
                table.uuid('deal_car_id').references('deal_cars.id');
                table.uuid('deal_trailer_id').references('deal_trailers');
            });
        })
        .then(function () {
            return knex.schema.dropTable('deals_to_files');
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('deal_drivers_to_files')
        .then(function () {
            return knex.schema.alterTable('deals', function(table) {
                table.dropColumn('deal_driver_id');
                table.dropColumn('deal_car_id');
                table.dropColumn('deal_trailer_id');
            });
        })
        .then(function () {
            return knex.schema.dropTable('deals_to_deal_files');
        })
        .then(function () {
            return knex.schema.dropTable('deal_drivers');
        })
        .then(function () {
            return knex.schema.dropTable('deal_trailers_to_files');
        })
        .then(function () {
            return knex.schema.dropTable('deal_trailers');
        })
        .then(function () {
            return knex.schema.dropTable('deal_cars_to_files');
        })
        .then(function () {
            return knex.schema.dropTable('deal_cars');
        })
        .then(function () {
            return knex.schema.dropTable('deal_files');
        })
        .then(function () {
            return knex.schema.createTable('deals_to_files', function(table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
                table.uuid('deal_id').references('deals.id').notNull();
                table.uuid('file_id').references('files.id').notNull();
                table.timestamp('created_at').defaultTo(knex.fn.now());
                table.unique(['deal_id', 'file_id']);
            });
        });
};
