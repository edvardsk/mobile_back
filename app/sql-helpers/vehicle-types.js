const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.VEHICLE_TYPES;

const selectRecordById = id => squelPostgres
    .select()
    .from(table.NAME)
    .where(`id = '${id}'`)
    .toString();

const selectRecords = () => squelPostgres
    .select()
    .from(table.NAME)
    .toString();

module.exports = {
    selectRecordById,
    selectRecords,
};
