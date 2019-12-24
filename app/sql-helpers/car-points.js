const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');
const { Geo } = require('constants/instances');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.CAR_POINTS;

const cols = table.COLUMNS;

squelPostgres.registerValueHandler(Geo, function(value) {
    return value.toString();
});

const insertRecord = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFields(values)
    .returning('*')
    .toString();

const selectLatestRecordByCarId = carId => squelPostgres
    .select()
    .from(table.NAME, 'c')
    .where(`${cols.CAR_ID} = '${carId}'`)
    .order(cols.CREATED_AT, false)
    .limit(1)
    .toString();

const selectLatestRecordByTrailerId = (trailerId) => squelPostgres
    .select()
    .from(table.NAME, 'c')
    .where(`${cols.TRAILER_ID} = '${trailerId}'`)
    .order(cols.CREATED_AT, false)
    .limit(1)
    .toString();

module.exports = {
    insertRecord,
    selectLatestRecordByCarId,
    selectLatestRecordByTrailerId,
};
