const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');
const { Geo } = require('constants/instances');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.CARGO_POINTS;

squelPostgres.registerValueHandler(Geo, function(value) {
    return value.toString();
});

const insertRecords = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFieldsRows(values)
    .returning('*')
    .toString();

module.exports = {
    insertRecords,
};
