const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');
const { Geo } = require('constants/instances');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.CAR_LATEST_POINTS;

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

const deleteRecordsByCarId = carId => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`${cols.CAR_ID} = '${carId}'`)
    .returning('*')
    .toString();

const deleteRecordsByDealId = dealId => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`${cols.DEAL_ID} = '${dealId}'`)
    .returning('*')
    .toString();


module.exports = {
    insertRecord,
    deleteRecordsByCarId,
    deleteRecordsByDealId,
};
