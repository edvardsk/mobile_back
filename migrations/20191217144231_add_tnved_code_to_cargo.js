
exports.up = function(knex) {
    return knex
        .from('tnved_codes')
        .first()
        .then((firstItem) => {
            return knex.schema.alterTable('cargos', function(table) {
                table.uuid('tnved_code_id').defaultTo(firstItem.id).references('tnved_codes.id').notNull();
            });
        });
};

exports.down = function(knex) {
    return knex.schema.alterTable('cargos', function (table) {
        table.dropColumn('tnved_code_id');
    });
};
