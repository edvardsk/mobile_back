const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.ROLES;
const cols = table.COLUMNS;

const selectRolesByNames = names => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.NAME} IN ?`, names)
    .toString();

const selectRoleById = id => squelPostgres
    .select()
    .from(table.NAME)
    .where(`id = '${id}'`)
    .toString();

module.exports = {
    selectRolesByNames,
    selectRoleById,
};
