
exports.up = function(knex) {
    return Promise.all([
        knex.schema.alterTable('deals', function(table) {
            table.uuid('driver_id').nullable().defaultTo(null).alter();
        }),
    ]);
};

exports.down = function(knex) {
    return knex('deals')
        .select('id')
        .whereNull('driver_id')
        .then(function (data) {
            return Promise.all(data.map((d) =>
                knex('deal_history_statuses')
                    .where('deal_id', d.id)
                    .del(),
            )).then(function() {
                return Promise.all(data.map((d) =>
                    knex('deals')
                        .where('id', d.id)
                        .del(),
                )).then(function() {
                    return Promise.all([
                        knex.schema.alterTable('deals', function (table) {
                            table.uuid('driver_id').notNull().alter();
                        }),
                    ]);
                });
            });
        });
};
