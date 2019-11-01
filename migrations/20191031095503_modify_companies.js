
exports.up = function(knex) {
    return Promise.all([
        knex.raw('ALTER TABLE companies alter column country_id DROP NOT NULL;'),
        knex.raw('ALTER TABLE companies alter column identity_number DROP NOT NULL;')
    ]);
};

exports.down = function(knex) {
    return Promise.all([
        knex.raw('ALTER TABLE companies ALTER COLUMN country_id SET NOT NULL;'),
        knex.raw('ALTER TABLE companies ALTER COLUMN identity_number SET NOT NULL;')
    ]);
};
