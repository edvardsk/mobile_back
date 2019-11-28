
exports.up = function(knex) {
    return Promise.all([
        knex.raw('ALTER TABLE companies ALTER "registered_at" type date;'),
        knex.raw('ALTER TABLE companies ALTER "insurance_policy_created_at" type date;'),
        knex.raw('ALTER TABLE companies ALTER "insurance_policy_expired_at" type date;'),
        knex.raw('ALTER TABLE companies ALTER "residency_certificate_created_at" type date;'),
        knex.raw('ALTER TABLE companies ALTER "residency_certificate_expired_at" type date;'),
        knex.raw('ALTER TABLE companies ALTER "state_registration_certificate_created_at" type date;'),

        knex.raw('ALTER TABLE users ALTER "passport_created_at" type date;'),
        knex.raw('ALTER TABLE users ALTER "passport_expired_at" type date;'),

        knex.raw('ALTER TABLE drivers ALTER "driver_licence_expired_at" type date;'),
        knex.raw('ALTER TABLE drivers ALTER "driver_licence_registered_at" type date;'),

    ]);
};

exports.down = function(knex) {
    return Promise.all([
        knex.raw('ALTER TABLE companies ALTER "registered_at" type timestamptz;'),
        knex.raw('ALTER TABLE companies ALTER "insurance_policy_created_at" type timestamptz;'),
        knex.raw('ALTER TABLE companies ALTER "insurance_policy_expired_at" type timestamptz;'),
        knex.raw('ALTER TABLE companies ALTER "residency_certificate_created_at" type timestamptz;'),
        knex.raw('ALTER TABLE companies ALTER "residency_certificate_expired_at" type timestamptz;'),
        knex.raw('ALTER TABLE companies ALTER "state_registration_certificate_created_at" type timestamptz;'),

        knex.raw('ALTER TABLE users ALTER "passport_created_at" type timestamptz;'),
        knex.raw('ALTER TABLE users ALTER "passport_expired_at" type timestamptz;'),

        knex.raw('ALTER TABLE drivers ALTER "driver_licence_expired_at" type timestamptz;'),
        knex.raw('ALTER TABLE drivers ALTER "driver_licence_registered_at" type timestamptz;'),
    ]);
};
