const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.ECONOMIC_SETTINGS;

const cols = table.COLUMNS;

const updateRecordWithNullCompanyId = values => squelPostgres
    .update()
    .table(table.NAME)
    .setFields(values)
    .where(`${cols.COMPANY_ID} IS NULL`)
    .returning('*')
    .toString();

const selectRecordWithNullCompanyId = () => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.COMPANY_ID} IS NULL`)
    .toString();

module.exports = {
    updateRecordWithNullCompanyId,
    selectRecordWithNullCompanyId,
};
