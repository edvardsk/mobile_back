exports.up = function(knex) {
    return knex('countries')
        .where('name', 'ukraine')
        .del()
        .then(function () {
            return knex('phone_prefixes')
                .where('prefix', 'UA')
                .del();
        });
};

exports.down = function(knex) {
    return knex('countries')
        .insert({
            name: 'ukraine',
            currency_id: 'a93a74f6-e923-492f-83bd-88067f5a0a2b',
        })
        .then(function () {
            return knex('phone_prefixes')
                .insert({
                    prefix: 'UA',
                    code: 380,
                });
        });
};
