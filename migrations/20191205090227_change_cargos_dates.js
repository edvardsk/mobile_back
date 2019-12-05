
exports.up = function(knex) {
    return Promise.all([
        knex.raw('ALTER TABLE cargos ALTER COLUMN downloading_date_from DROP NOT NULL;'),
        knex.raw('ALTER TABLE cargos ALTER COLUMN downloading_date_to SET NOT NULL;'),
    ]);
};

exports.down = function(knex) {
    return Promise.all([
        knex.raw('ALTER TABLE cargos ALTER COLUMN downloading_date_to DROP NOT NULL;'),
        knex.raw('ALTER TABLE cargos ALTER COLUMN downloading_date_from SET NOT NULL;')
    ]);
};
