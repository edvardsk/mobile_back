const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.TRAILERS_STATE_NUMBERS;

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

const updateActiveRecordsByTrailerId = (trailerId, data) => squelPostgres
    .update()
    .table(table.NAME)
    .setFields(data)
    .where(`${cols.TRAILER_ID} = '${trailerId}'`)
    .returning('*')
    .toString();

const selectActiveRecordByTrailerId = trailerId => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.TRAILER_ID} = '${trailerId}'`)
    .where(`${cols.IS_ACTIVE} = 't'`)
    .toString();

module.exports = {
    insertRecord,
    insertRecords,
    updateActiveRecordsByTrailerId,
    selectActiveRecordByTrailerId,
};
