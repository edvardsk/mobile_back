const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');
const { SqlArray } = require('constants/instances');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.FILES;
const tableCompaniesFiles = SQL_TABLES.COMPANIES_TO_FILES;
const tableUsersFiles = SQL_TABLES.USERS_TO_FILES;
const tableCarsFiles = SQL_TABLES.CARS_TO_FILES;

const cols = table.COLUMNS;
const colsCompaniesFiles = tableCompaniesFiles.COLUMNS;
const colsUsersFiles = tableUsersFiles.COLUMNS;
const colsCarsFiles = tableCarsFiles.COLUMNS;

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

const selectFilesByCarIdAndLabels = (carId, labels) => squelPostgres
    .select()
    .from(table.NAME, 'f')
    .field('f.*')
    .where(`cf.${colsCarsFiles.CAR_ID} = '${carId}'`)
    .where(`f.${cols.LABELS} && ARRAY[${labels.map(label => `'${label}'`).toString()}]`)
    .left_join(tableCarsFiles.NAME, 'cf', `cf.${colsCarsFiles.FILE_ID} = f.id`)
    .toString();

const selectFilesByUserIdAndLabels = (userId, labels) => squelPostgres
    .select()
    .from(table.NAME, 'f')
    .field('f.*')
    .where(`uf.${colsUsersFiles.USER_ID} = '${userId}'`)
    .where(`f.${cols.LABELS} && ARRAY[${labels.map(label => `'${label}'`).toString()}]`)
    .left_join(tableUsersFiles.NAME, 'uf', `uf.${colsCompaniesFiles.FILE_ID} = f.id`)
    .toString();

const selectFilesByUserId = userId => squelPostgres
    .select()
    .from(table.NAME, 'f')
    .where(`uf.${colsUsersFiles.USER_ID} = '${userId}'`)
    .left_join(tableUsersFiles.NAME, 'uf', `uf.${colsUsersFiles.FILE_ID} = f.id`)
    .toString();

module.exports = {
    insertFiles,
    deleteFilesByIds,
    selectFilesByCompanyId,
    selectFilesByCompanyIdAndLabel,
    selectFilesByCompanyIdAndLabels,
    selectFilesByCarIdAndLabels,
    selectFilesByUserIdAndLabels,
    selectFilesByUserId,
};
