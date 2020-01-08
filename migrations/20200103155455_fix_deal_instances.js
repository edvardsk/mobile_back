exports.up = function(knex) {
    return Promise.all([
        knex.raw('ALTER TABLE deal_cars ALTER COLUMN car_vin DROP NOT NULL;'),
        knex.raw('ALTER TABLE deal_cars ALTER COLUMN car_mark DROP NOT NULL;'),
        knex.raw('ALTER TABLE deal_cars ALTER COLUMN car_model DROP NOT NULL;'),
        knex.raw('ALTER TABLE deal_cars ALTER COLUMN car_made_year_at DROP NOT NULL;'),
        knex.raw('ALTER TABLE deal_cars ALTER COLUMN car_type DROP NOT NULL;'),

        knex.raw('ALTER TABLE deal_trailers ALTER COLUMN trailer_vin DROP NOT NULL;'),
        knex.raw('ALTER TABLE deal_trailers ALTER COLUMN trailer_mark DROP NOT NULL;'),
        knex.raw('ALTER TABLE deal_trailers ALTER COLUMN trailer_model DROP NOT NULL;'),
        knex.raw('ALTER TABLE deal_trailers ALTER COLUMN trailer_made_year_at DROP NOT NULL;'),
        knex.raw('ALTER TABLE deal_trailers ALTER COLUMN trailer_loading_methods DROP NOT NULL;'),
        knex.raw('ALTER TABLE deal_trailers ALTER COLUMN trailer_vehicle_type_id DROP NOT NULL;'),
        knex.raw('ALTER TABLE deal_trailers ALTER COLUMN trailer_danger_class_id DROP NOT NULL;'),
        knex.raw('ALTER TABLE deal_trailers ALTER COLUMN trailer_width DROP NOT NULL;'),
        knex.raw('ALTER TABLE deal_trailers ALTER COLUMN trailer_height DROP NOT NULL;'),
        knex.raw('ALTER TABLE deal_trailers ALTER COLUMN trailer_length DROP NOT NULL;'),
        knex.raw('ALTER TABLE deal_trailers ALTER COLUMN trailer_carrying_capacity DROP NOT NULL;'),

        knex.raw('ALTER TABLE deal_drivers ALTER COLUMN driver_licence_registered_at DROP NOT NULL;'),
        knex.raw('ALTER TABLE deal_drivers ALTER COLUMN driver_licence_expired_at DROP NOT NULL;'),
        knex.raw('ALTER TABLE deal_drivers ALTER COLUMN passport_number DROP NOT NULL;'),
        knex.raw('ALTER TABLE deal_drivers ALTER COLUMN passport_personal_id DROP NOT NULL;'),
        knex.raw('ALTER TABLE deal_drivers ALTER COLUMN passport_issuing_authority DROP NOT NULL;'),
        knex.raw('ALTER TABLE deal_drivers ALTER COLUMN passport_created_at DROP NOT NULL;'),
        knex.raw('ALTER TABLE deal_drivers ALTER COLUMN passport_expired_at DROP NOT NULL;'),
    ]);
};

exports.down = function(knex) {
    return Promise.all([
        knex.raw('ALTER TABLE deal_cars ALTER COLUMN car_vin SET NOT NULL;'),
        knex.raw('ALTER TABLE deal_cars ALTER COLUMN car_mark SET NOT NULL;'),
        knex.raw('ALTER TABLE deal_cars ALTER COLUMN car_model SET NOT NULL;'),
        knex.raw('ALTER TABLE deal_cars ALTER COLUMN car_made_year_at SET NOT NULL;'),
        knex.raw('ALTER TABLE deal_cars ALTER COLUMN car_type SET NOT NULL;'),

        knex.raw('ALTER TABLE deal_trailers ALTER COLUMN trailer_vin SET NOT NULL;'),
        knex.raw('ALTER TABLE deal_trailers ALTER COLUMN trailer_mark SET NOT NULL;'),
        knex.raw('ALTER TABLE deal_trailers ALTER COLUMN trailer_model SET NOT NULL;'),
        knex.raw('ALTER TABLE deal_trailers ALTER COLUMN trailer_made_year_at SET NOT NULL;'),
        knex.raw('ALTER TABLE deal_trailers ALTER COLUMN trailer_loading_methods SET NOT NULL;'),
        knex.raw('ALTER TABLE deal_trailers ALTER COLUMN trailer_vehicle_type_id SET NOT NULL;'),
        knex.raw('ALTER TABLE deal_trailers ALTER COLUMN trailer_danger_class_id SET NOT NULL;'),
        knex.raw('ALTER TABLE deal_trailers ALTER COLUMN trailer_width SET NOT NULL;'),
        knex.raw('ALTER TABLE deal_trailers ALTER COLUMN trailer_height SET NOT NULL;'),
        knex.raw('ALTER TABLE deal_trailers ALTER COLUMN trailer_length SET NOT NULL;'),
        knex.raw('ALTER TABLE deal_trailers ALTER COLUMN trailer_carrying_capacity SET NOT NULL;'),

        knex.raw('ALTER TABLE deal_drivers ALTER COLUMN driver_licence_registered_at SET NOT NULL;'),
        knex.raw('ALTER TABLE deal_drivers ALTER COLUMN driver_licence_expired_at SET NOT NULL;'),
        knex.raw('ALTER TABLE deal_drivers ALTER COLUMN passport_number SET NOT NULL;'),
        knex.raw('ALTER TABLE deal_drivers ALTER COLUMN passport_personal_id SET NOT NULL;'),
        knex.raw('ALTER TABLE deal_drivers ALTER COLUMN passport_issuing_authority SET NOT NULL;'),
        knex.raw('ALTER TABLE deal_drivers ALTER COLUMN passport_created_at SET NOT NULL;'),
        knex.raw('ALTER TABLE deal_drivers ALTER COLUMN passport_expired_at SET NOT NULL;'),
    ]);
};
