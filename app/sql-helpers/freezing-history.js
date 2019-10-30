const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.FREEZING_HISTORY;

const insertRecord = value => squelPostgres
    .insert()
    .into(table.NAME)
    .setFields(value)
    .returning('*')
    .toString();

module.exports = {
    insertRecord,
};
