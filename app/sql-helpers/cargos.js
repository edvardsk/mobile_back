const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');
const { SqlArray } = require('constants/instances');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.CARGOS;

const cols = table.COLUMNS;

squelPostgres.registerValueHandler(SqlArray, function(value) {
    return value.toString();
});

const insertRecord = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFields(values)
    .returning('*')
    .toString();

const selectRecordsByCompanyId = companyId => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.COMPANY_ID} = '${companyId}'`)
    .toString();

module.exports = {
    insertRecord,
    selectRecordsByCompanyId,
};
