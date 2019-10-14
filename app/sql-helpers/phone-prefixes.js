const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.PHONE_PREFIXES;

const selectRecords = () => squelPostgres
    .select()
    .from(table.NAME)
    .toString();

const selectRecordById = id => squelPostgres
    .select()
    .from(table.NAME)
    .where(`id = '${id}'`)
    .toString();

module.exports = {
    selectRecords,
    selectRecordById,
};
