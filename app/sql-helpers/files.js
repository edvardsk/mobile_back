const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.FILES;
const tableCompaniesFiles = SQL_TABLES.COMPANIES_TO_FILES;

const cols = table.COLUMNS;
const colsCompaniesFiles  = tableCompaniesFiles.COLUMNS;

const insertFiles = values => {
    return squelPostgres
        .insert()
        .into(table.NAME)
        .setFieldsRows(values)
        .returning('*')
        .toString();
};

const deleteFilesByIds = ids => squelPostgres
    .delete()
    .from(table.NAME)
    .where('id IN ?', ids)
    .returning('*')
    .toString();

const selectFilesByCompanyIdAndTypes = (companyId, types, notPrefix) => squelPostgres
    .select()
    .from(table.NAME, 'f')
    .field('f.*')
    .where(`cf.${colsCompaniesFiles.COMPANY_ID} = '${companyId}'`)
    .where(`f.${cols.TYPE} ${notPrefix} IN ?`, types)
    .left_join(tableCompaniesFiles.NAME, 'cf', `cf.${colsCompaniesFiles.FILE_ID} = f.id`)
    .toString();

module.exports = {
    insertFiles,
    deleteFilesByIds,
    selectFilesByCompanyIdAndTypes,
};
