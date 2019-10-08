const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.FILE_LABELS;

const selectLabels = () => squelPostgres
    .select()
    .from(table.NAME)
    .toString();

module.exports = {
    selectLabels,
};
