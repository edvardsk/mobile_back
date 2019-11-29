const FIRST_CURRENCIES = require('./20191126121033_add_currencies').CURRENCIES;
const USD = require('./20191128133812_insert_currency_dollar').USD;

const CURRENCIES = [
    ...FIRST_CURRENCIES,
    USD,
];

const PRIORITIES = [
    {
        currency_id: CURRENCIES.find(currency => currency.code === 'byn').id,
        next_currency_id: CURRENCIES.find(currency => currency.code === 'rub').id,
    },
    {
        currency_id: CURRENCIES.find(currency => currency.code === 'rub').id,
        next_currency_id: CURRENCIES.find(currency => currency.code === 'usd').id,
    },
    {
        currency_id: CURRENCIES.find(currency => currency.code === 'usd').id,
        next_currency_id: CURRENCIES.find(currency => currency.code === 'eur').id,
    },
    {
        currency_id: CURRENCIES.find(currency => currency.code === 'eur').id,
        next_currency_id: null,
    },

];

exports.up = function(knex) {
    return knex.schema.createTable('currency_priorities', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('currency_id').references('currencies.id').notNull().unique();
        table.uuid('next_currency_id').references('currencies.id').unique();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
        .then(function () {
            return Promise.all([
                knex.raw('CREATE UNIQUE INDEX next_currency_id_index ON currency_priorities ((next_currency_id IS NULL)) WHERE next_currency_id IS NULL;'),
            ]);
        })
        .then(function () {
            return knex.batchInsert('currency_priorities', PRIORITIES);
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('currency_priorities');
};
