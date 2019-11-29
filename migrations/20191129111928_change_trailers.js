
exports.up = function(knex) {
    return Promise.all([
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_loading_methods SET NOT NULL;'),
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_vehicle_type_id SET NOT NULL;'),
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_danger_class_id SET NOT NULL;'),
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_width SET NOT NULL;'),
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_height SET NOT NULL;'),
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_length SET NOT NULL;'),
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_weight SET NOT NULL;'),

        knex.raw('ALTER TABLE trailers ALTER COLUMN car_id DROP NOT NULL;'),
    ]);
};

exports.down = function(knex) {
    return Promise.all([
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_loading_methods DROP NOT NULL;'),
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_vehicle_type_id DROP NOT NULL;'),
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_danger_class_id DROP NOT NULL;'),
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_width DROP NOT NULL;'),
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_height DROP NOT NULL;'),
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_length DROP NOT NULL;'),
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_weight DROP NOT NULL;'),

        knex.raw('ALTER TABLE trailers ALTER COLUMN car_id SET NOT NULL;'),
    ]);
};


// return knex.schema.createTable('trailers', function(table) {
//     table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
//     table.uuid('car_id').references('cars.id').notNull().unique();
//     table.string('trailer_mark').notNull();
//     table.string('trailer_model').notNull();
//     table.integer('trailer_made_year_at').notNull();
//     table.specificType('trailer_loading_methods', 'text[]');
//     table.uuid('trailer_vehicle_type_id').references('vehicle_types.id');
//     table.uuid('trailer_danger_class_id').references('danger_classes.id');
//     table.decimal('trailer_width', 10, 2);
//     table.decimal('trailer_height', 10, 2);
//     table.decimal('trailer_length', 10, 2);
//     table.decimal('trailer_weight', 10, 2);
//     table.timestamp('created_at').defaultTo(knex.fn.now());
//     table.boolean('deleted').notNull().defaultTo(false);
// });
