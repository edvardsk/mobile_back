const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');
const { SqlArray } = require('constants/instances');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.FILES;
const tableCompaniesFiles = SQL_TABLES.COMPANIES_TO_FILES;

const cols = table.COLUMNS;
const colsCompaniesFiles  = tableCompaniesFiles.COLUMNS;

squelPostgres.registerValueHandler(SqlArray, function(value) {
    return value.toString();
});

const insertFiles = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFieldsRows(values)
    .returning('*')
    .toString();

const deleteFilesByIds = ids => squelPostgres
    .delete()
    .from(table.NAME)
    .where('id IN ?', ids)
    .returning('*')
    .toString();

const selectFilesByCompanyId = companyId => squelPostgres
    .select()
    .from(table.NAME, 'f')
    .field('f.*')
    .where(`cf.${colsCompaniesFiles.COMPANY_ID} = '${companyId}'`)
    .left_join(tableCompaniesFiles.NAME, 'cf', `cf.${colsCompaniesFiles.FILE_ID} = f.id`)
    .toString();

const selectFilesByCompanyIdAndLabel = (companyId, fileGroup) => squelPostgres
    .select()
    .from(table.NAME, 'f')
    .field('f.*')
    .where(`cf.${colsCompaniesFiles.COMPANY_ID} = '${companyId}'`)
    .where(`f.${cols.LABELS} @> ARRAY['${fileGroup}']`)
    .left_join(tableCompaniesFiles.NAME, 'cf', `cf.${colsCompaniesFiles.FILE_ID} = f.id`)
    .toString();

const selectFilesByCompanyIdAndLabels = (companyId, labels) => squelPostgres
    .select()
    .from(table.NAME, 'f')
    .field('f.*')
    .where(`cf.${colsCompaniesFiles.COMPANY_ID} = '${companyId}'`)
    .where(`f.${cols.LABELS} && ARRAY[${labels.map(label => `'${label}'`).toString()}]`)
    .left_join(tableCompaniesFiles.NAME, 'cf', `cf.${colsCompaniesFiles.FILE_ID} = f.id`)
    .toString();

module.exports = {
    insertFiles,
    deleteFilesByIds,
    selectFilesByCompanyId,
    selectFilesByCompanyIdAndLabel,
    selectFilesByCompanyIdAndLabels,
};
