const squel = require('squel');
const { get } = require('lodash');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.USERS;

const cols = table.COLUMNS;

const insertUser = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFields(values)
    .returning('*')
    .toString();

const selectUser = id => squelPostgres
    .select()
    .from(table.NAME)
    .where(`id = '${id}'`)
    .toString();

const selectUserByName = name => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.NAME} = '${name}'`)
    .toString();

const updateUser = (id, data) => squelPostgres
    .update()
    .table(table.NAME)
    .setFields(data)
    .where(`id = '${id}'`)
    .returning('*')
    .toString();

module.exports = {
    insertUser,
    selectUser,
    selectUserByName,
    updateUser,
};
