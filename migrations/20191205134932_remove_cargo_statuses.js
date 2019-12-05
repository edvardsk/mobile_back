const NEW = {
    id: '595bf5db-9bbd-41aa-86ce-751ceeda2316',
    name: 'new',
};

const CARGO_STATUSES = [
    NEW,
];

exports.up = function(knex) {
    return knex.schema.alterTable('cargos', function (table) {
        table.dropColumn('status_id');
    })
        .then(function () {
            return knex.schema.dropTable('cargo_statuses');
        });
};

exports.down = function(knex) {
    return knex.schema.createTable('cargo_statuses', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.string('name', 50).notNull().unique();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
        .then(function () {
            return  knex.batchInsert('cargo_statuses', CARGO_STATUSES);
        })
        .then(function () {
            return knex.schema.alterTable('cargos', function (table) {
                table.uuid('status_id').references('cargo_statuses.id').notNull().defaultTo(NEW.id);
            });
        });
};
