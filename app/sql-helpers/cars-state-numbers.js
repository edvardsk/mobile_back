const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.CARS_STATE_NUMBERS;

const cols = table.COLUMNS;

const insertRecord = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFields(values)
    .returning('*')
    .toString();

const insertRecords = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFieldsRows(values)
    .returning('*')
    .toString();

const updateActiveRecordsByCarId = (carId, data) => squelPostgres
    .update()
    .table(table.NAME)
    .setFields(data)
    .where(`${cols.CAR_ID} = '${carId}'`)
    .returning('*')
    .toString();

const selectActiveRecordByCarId = carId => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.CAR_ID} = '${carId}'`)
    .where(`${cols.IS_ACTIVE} = 't'`)
    .toString();

module.exports = {
    insertRecord,
    insertRecords,
    updateActiveRecordsByCarId,
    selectActiveRecordByCarId,
};
