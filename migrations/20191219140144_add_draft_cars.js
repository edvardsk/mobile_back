
exports.up = function(knex) {
    return knex.schema.createTable('draft_cars', function(table) {
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
        table.specificType('comments', 'text[]').defaultTo('{}');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.unique('car_id');
    })
        .then(function () {
            return knex.schema.createTable('draft_cars_to_files', function(table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
                table.uuid('draft_car_id').references('draft_cars.id').notNull();
                table.uuid('draft_file_id').references('draft_files.id').notNull();
                table.timestamp('created_at').defaultTo(knex.fn.now());
                table.unique(['draft_car_id', 'draft_file_id']);
            });
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('draft_cars_to_files')
        .then(function () {
            return knex.schema.dropTable('draft_cars');
        });
};
