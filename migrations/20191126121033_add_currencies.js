
const BYN = {
    id: '2312c3e3-6e08-44fb-8af7-1a942eaf98e1',
    code: 'byn',
};

const RUB = {
    id: '4b208e83-34c7-4081-b840-55408d60631b',
    code: 'rub',
};

const EUR = {
    id: 'a93a74f6-e923-492f-83bd-88067f5a0a2b',
    code: 'eur',
};


const CURRENCIES = [BYN, RUB, EUR];

exports.CURRENCIES = CURRENCIES;

exports.up = function(knex) {
    return knex.schema.createTable('currencies', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.string('code', 3).notNull().unique();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
        .then(function () {
            return knex.batchInsert('currencies', CURRENCIES);
        })
        .then(function () {
            return knex.schema.alterTable('countries', function(table) {
                table.uuid('currency_id').references('currencies.id');
            });
        })
        .then(function () {
            return knex('countries')
                .where('name', '=', 'belarus')
                .update({
                    currency_id: BYN.id,
                });
        })
        .then(function () {
            return knex('countries')
                .where('name', '=', 'russia')
                .update({
                    currency_id: RUB.id,
                });
        })
        .then(function () {
            return knex('countries')
                .where('name', '=', 'ukraine')
                .update({
                    currency_id: EUR.id,
                });
        })
        .then(function () {
            return knex.raw('ALTER TABLE countries ALTER COLUMN currency_id SET NOT NULL;');
        });
};

exports.down = function(knex) {
    return knex.raw('ALTER TABLE countries ALTER COLUMN currency_id DROP NOT NULL;')
        .then(function () {
            return knex.schema.alterTable('countries', function (table) {
                table.dropColumn('currency_id');
            });
        })
        .then(function () {
            return knex.schema.dropTable('currencies');
        });
};
