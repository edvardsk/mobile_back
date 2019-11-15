const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.ECONOMIC_SETTINGS;

const cols = table.COLUMNS;

const insertRecord = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFields(values)
    .returning('*')
    .toString();

const updateRecordByCompanyId = (companyId, values) => squelPostgres
    .update()
    .table(table.NAME)
    .setFields(values)
    .where(`${cols.COMPANY_ID} = '${companyId}'`)
    .returning('*')
    .toString();

const deleteRecordByCompanyId = companyId => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`${cols.COMPANY_ID} = '${companyId}'`)
    .returning('*')
    .toString();

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

const selectRecordByCompanyId = companyId => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.COMPANY_ID} = '${companyId}'`)
    .toString();

module.exports = {
    insertRecord,
    updateRecordByCompanyId,
    deleteRecordByCompanyId,
    updateRecordWithNullCompanyId,
    selectRecordWithNullCompanyId,
    selectRecordByCompanyId,
};
