const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');
const { SqlArray } = require('constants/instances');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.POINTS;

const cols = table.COLUMNS;

squelPostgres.registerValueHandler(SqlArray, function(value) {
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
    .where(`${cols.POINT} IN ?`, points)
    .toString();

module.exports = {
    insertRecords,
    selectRecordsByPoints,
};
