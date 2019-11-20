
exports.up = function(knex) {
    return knex.raw('ALTER TABLE cargos ALTER "gross_weight" type numeric(6,2);')
        .then(function () {
            return knex.raw('ALTER TABLE cargos ALTER "width" type numeric(6,2);');
        })
        .then(function () {
            return knex.raw('ALTER TABLE cargos ALTER "height" type numeric(6,2);');
        })
        .then(function () {
            return knex.raw('ALTER TABLE cargos ALTER "length" type numeric(6,2);');
        })
        .then(function () {
            return Promise.all([
                knex.raw('ALTER TABLE cargos ADD CONSTRAINT gross_weight_check CHECK (gross_weight > 0 AND gross_weight < 1000)'),
                knex.raw('ALTER TABLE cargos ADD CONSTRAINT width_check CHECK (width > 0 AND width < 1000)'),
                knex.raw('ALTER TABLE cargos ADD CONSTRAINT height_check CHECK (height > 0 AND height < 1000)'),
                knex.raw('ALTER TABLE cargos ADD CONSTRAINT length_check CHECK (length > 0 AND length < 1000)'),
            ]);
        });
};

exports.down = function(knex) {
    return knex.raw('ALTER TABLE cargos ALTER "gross_weight" type real;')
        .then(function () {
            return knex.raw('ALTER TABLE cargos ALTER "width" type real;');
        })
        .then(function () {
            return knex.raw('ALTER TABLE cargos ALTER "height" type real;');
        })
        .then(function () {
            return knex.raw('ALTER TABLE cargos ALTER "length" type real;');
        })
        .then(function () {
            return Promise.all([
                knex.raw('ALTER TABLE cargos DROP CONSTRAINT gross_weight_check;'),
                knex.raw('ALTER TABLE cargos DROP CONSTRAINT width_check;'),
                knex.raw('ALTER TABLE cargos DROP CONSTRAINT height_check;'),
                knex.raw('ALTER TABLE cargos DROP CONSTRAINT length_check;'),
            ]);
        });
};
