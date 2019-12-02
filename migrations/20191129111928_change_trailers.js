
exports.up = function(knex) {
    return Promise.all([
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_loading_methods SET NOT NULL;'),
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_vehicle_type_id SET NOT NULL;'),
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_danger_class_id SET NOT NULL;'),
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_width SET NOT NULL;'),
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_height SET NOT NULL;'),
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_length SET NOT NULL;'),
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_carrying_capacity SET NOT NULL;'),

        knex.raw('ALTER TABLE trailers ALTER COLUMN car_id DROP NOT NULL;'),
    ])
        .then(function () {
            return knex.schema.alterTable('trailers', function(table) {
                table.uuid('company_id').references('companies.id').notNull();
            });
        })
        .then(function () {
            return knex.raw('ALTER TABLE trailers_state_numbers DROP CONSTRAINT trailers_state_numbers_trailer_id_foreign;');
        })
        .then(function () {
            return knex.raw('ALTER TABLE trailers_state_numbers ADD CONSTRAINT trailers_state_numbers_trailer_id_foreign FOREIGN KEY (trailer_id) references trailers(id);');
        });
};

exports.down = function(knex) {
    return Promise.all([
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_loading_methods DROP NOT NULL;'),
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_vehicle_type_id DROP NOT NULL;'),
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_danger_class_id DROP NOT NULL;'),
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_width DROP NOT NULL;'),
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_height DROP NOT NULL;'),
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_length DROP NOT NULL;'),
        knex.raw('ALTER TABLE trailers ALTER COLUMN trailer_carrying_capacity DROP NOT NULL;'),

        knex.raw('ALTER TABLE trailers ALTER COLUMN car_id SET NOT NULL;'),
    ])
        .then(function () {
            return knex.schema.alterTable('trailers', function(table) {
                table.dropColumn('company_id');
            });
        });
};
