
exports.up = function(knex) {
    return knex.schema.createTable('draft_trailers', function(table) {
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
        table.specificType('comments', 'text[]').defaultTo('{}');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.unique('trailer_id');
    })
        .then(function () {
            return knex.schema.createTable('draft_trailers_to_files', function(table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
                table.uuid('draft_trailer_id').references('draft_trailers.id').notNull();
                table.uuid('draft_file_id').references('draft_files.id').notNull();
                table.timestamp('created_at').defaultTo(knex.fn.now());
                table.unique(['draft_trailer_id', 'draft_file_id']);
            });
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('draft_trailers_to_files')
        .then(function () {
            return knex.schema.dropTable('draft_trailers');
        });
};
