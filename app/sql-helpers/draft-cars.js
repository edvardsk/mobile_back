const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');
const { SqlArray } = require('constants/instances');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.DRAFT_CARS;

const cols = table.COLUMNS;

squelPostgres.registerValueHandler(SqlArray, function(value) {
    return value.toString();
});

const insertRecord = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFields(values)
    .returning('*')
    .toString();

const updateRecordByCarId = (carId, values) => squelPostgres
    .update()
    .table(table.NAME)
    .setFields(values)
    .where(`${cols.CAR_ID} = '${carId}'`)
    .returning('*')
    .toString();

const updateRecordById = (id, values) => squelPostgres
    .update()
    .table(table.NAME)
    .setFields(values)
    .where(`id = '${id}'`)
    .returning('*')
    .toString();

const deleteRecordById = id => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`id = '${id}'`)
    .returning('*')
    .toString();

const selectRecordById = id => squelPostgres
    .select()
    .from(table.NAME)
    .where(`id = '${id}'`)
    .toString();

const selectRecordByCarId = carId => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.CAR_ID} = '${carId}'`)
    .toString();

const updateRecordAppendCommentsById = (id, comments) => squelPostgres
    .update()
    .table(table.NAME)
    .set(`${cols.COMMENTS} = ${cols.COMMENTS} || '{${comments}}'`)
    .where(`id = '${id}'`)
    .returning('*')
    .toString();

module.exports = {
    insertRecord,
    updateRecordByCarId,
    updateRecordById,
    deleteRecordById,
    updateRecordAppendCommentsById,
    selectRecordById,
    selectRecordByCarId,
};
