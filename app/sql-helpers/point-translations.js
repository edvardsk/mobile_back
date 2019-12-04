const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');
const { SqlString } = require('constants/instances');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.POINT_TRANSLATIONS;

squelPostgres.registerValueHandler(SqlString, function(value) {
    return value.toString();
});

const insertRecords = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFieldsRows(values)
    .returning('*')
    .toString();

const insertRecord = data => squelPostgres
    .insert()
    .into(table.NAME)
    .setFields(data)
    .returning('*')
    .toString();

module.exports = {
    insertRecords,
    insertRecord,
};
