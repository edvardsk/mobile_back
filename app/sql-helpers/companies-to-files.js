const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.COMPANIES_TO_FILES;
const tableFiles = SQL_TABLES.FILES;

const cols = table.COLUMNS;
const colsFiles = tableFiles.COLUMNS;

const insertRecords = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFieldsRows(values)
    .returning('*')
    .toString();

const selectFilesByCompanyId = companyId => squelPostgres
    .select()
    .from(table.NAME, 'cf')
    .where(`cf.${cols.COMPANY_ID} = '${companyId}'`)
    .left_join(tableFiles.NAME, 'f', `f.id = cf.${cols.FILE_ID}`)
    .toString();

const selectFilesByCompanyIdAndLabels = (companyId, labels) => squelPostgres
    .select()
    .from(table.NAME, 'cf')
    .where(`cf.${cols.COMPANY_ID} = '${companyId}'`)
    .where(`f.${colsFiles.LABELS} && ARRAY['${labels}']`)
    .left_join(tableFiles.NAME, 'f', `f.id = cf.${cols.FILE_ID}`)
    .toString();

const deleteRecordsByCompanyId = companyId => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`${cols.COMPANY_ID} = '${companyId}'`)
    .returning('*')
    .toString();

const deleteRecordsByFileIds = fileIds => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`${cols.FILE_ID} IN ?`, fileIds)
    .returning('*')
    .toString();

module.exports = {
    insertRecords,
    selectFilesByCompanyId,
    selectFilesByCompanyIdAndLabels,
    deleteRecordsByCompanyId,
    deleteRecordsByFileIds,
};
