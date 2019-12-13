
exports.up = function(knex) {
    return Promise.all([
        knex.raw('ALTER TABLE cargos DROP CONSTRAINT free_count_check'),
        knex.raw('ALTER TABLE cargos ADD CONSTRAINT free_count_check CHECK (free_count >= 0)'),
    ]);
};

exports.down = function(knex) {
    return Promise.all([
        knex.raw('ALTER TABLE cargos DROP CONSTRAINT free_count_check'),
        knex.raw('ALTER TABLE cargos ADD CONSTRAINT free_count_check CHECK (free_count > 0)'),
    ]);
};
