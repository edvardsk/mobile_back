const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');
const { Geo } = require('constants/instances');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.POINTS;

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

const selectRecordsByPoints = points => squelPostgres
    .select()
    .from(table.NAME)
    .field('*')
    .field(`ST_AsText(${cols.COORDINATES})`, cols.COORDINATES)
    .where(`${cols.COORDINATES} IN ?`, points)
    .toString();

const selectRecordById = id => squelPostgres
    .select()
    .from(table.NAME)
    .field('*')
    .field(`ST_AsText(${cols.COORDINATES})`, cols.COORDINATES)
    .where(`id = '${id}'`)
    .toString();

module.exports = {
    insertRecords,
    selectRecordsByPoints,
    selectRecordById,
};
