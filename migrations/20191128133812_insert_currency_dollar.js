
const USD = {
    id: 'df35b094-c51b-4f8b-900a-36f519e4179d',
    code: 'usd',
};

exports.up = function(knex) {
    return knex('currencies')
        .insert({
            ...USD,
        })
        .then(function () {
            return knex('exchange_rates')
                .del();
        });
};

exports.down = function(knex) {
    return knex('currencies')
        .where('code', 'usd')
        .del()
        .then(function () {
            return knex('exchange_rates')
                .del();
        });
};
