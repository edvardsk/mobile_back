const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.DEAL_SUB_STATUSES;

const cols = table.COLUMNS;

const selectRecordByName = name => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.NAME} = '${name}'`)
    .toString();

module.exports = {
    selectRecordByName,
};
