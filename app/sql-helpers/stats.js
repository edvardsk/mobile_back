const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.STATS;

const cols = table.COLUMNS;

const insertStats = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFields(values)
    .returning('*')
    .toString();

const selectStats = id => squelPostgres
    .select()
    .from(table.NAME)
    .where(`id = '${id}'`)
    .toString();

const selectStatsByUser = userId => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.USER_ID} = '${userId}'`)
    .toString();

const updateStats = (id, data) => squelPostgres
    .update()
    .table(table.NAME)
    .setFields(data)
    .where(`id = '${id}'`)
    .returning('*')
    .toString();

module.exports = {
    insertStats,
    selectStats,
    selectStatsByUser,
    updateStats,
};
