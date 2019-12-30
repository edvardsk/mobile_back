const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');
const { Geo } = require('constants/instances');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.CARGO_POINTS;

const cols = table.COLUMNS;

squelPostgres.registerValueHandler(Geo, function(value) {
    return value.toString();
});

const insertRecords = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFieldsRows(values)
    .returning('*')
    .toString();

const deleteRecordsByCargoId = cargoId => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`${cols.CARGO_ID} = '${cargoId}'`)
    .returning('*')
    .toString();

const selectRecordsByCargoId = cargoId => squelPostgres
    .select()
    .field('*')
    .field(`ST_AsText(${cols.COORDINATES})`, cols.COORDINATES)
    .from(table.NAME)
    .where(`${cols.CARGO_ID} = '${cargoId}'`)
    .toString();

module.exports = {
    insertRecords,
    deleteRecordsByCargoId,
    selectRecordsByCargoId,
};
