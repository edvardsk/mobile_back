const moment = require('moment');

exports.up = function(knex) {
    return knex.schema.alterTable('cargos', function(table) {
        table.timestamp('freezed_after').defaultTo(moment().add(14, 'days').toISOString());
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('cargos', function (table) {
        table.dropColumn('freezed_after');
    });
};
