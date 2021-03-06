const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');
const { SqlArray } = require('constants/instances');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.FILES;
const tableCompaniesFiles = SQL_TABLES.COMPANIES_TO_FILES;
const tableUsersFiles = SQL_TABLES.USERS_TO_FILES;
const tableCarsFiles = SQL_TABLES.CARS_TO_FILES;
const tableTrailersFiles = SQL_TABLES.TRAILERS_TO_FILES;
const tableDrivers = SQL_TABLES.DRIVERS;

const cols = table.COLUMNS;
const colsCompaniesFiles = tableCompaniesFiles.COLUMNS;
const colsUsersFiles = tableUsersFiles.COLUMNS;
const colsCarsFiles = tableCarsFiles.COLUMNS;
const colsTrailersFiles = tableTrailersFiles.COLUMNS;
const colsDrivers = tableDrivers.COLUMNS;

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

const selectFilesByCarIdAndArrayLabels = (carId, labelsArr) => {
    const exp = squelPostgres
        .select()
        .from(table.NAME, 'f')
        .field('f.*')
        .where(`cf.${colsCarsFiles.CAR_ID} = '${carId}'`);

    setLabelsArrFilter(exp, labelsArr);

    return exp
        .left_join(tableCarsFiles.NAME, 'cf', `cf.${colsCarsFiles.FILE_ID} = f.id`)
        .toString();
};

const selectFilesByTrailerIdAndLabels = (trailerId, labels) => squelPostgres
    .select()
    .from(table.NAME, 'f')
    .field('f.*')
    .where(`tf.${colsTrailersFiles.TRAILER_ID} = '${trailerId}'`)
    .where(`f.${cols.LABELS} && ARRAY[${labels.map(label => `'${label}'`).toString()}]`)
    .left_join(tableTrailersFiles.NAME, 'tf', `tf.${colsTrailersFiles.FILE_ID} = f.id`)
    .toString();

const selectFilesByTrailerIdAndArrayLabels = (trailerId, labelsArr) => {
    const exp = squelPostgres
        .select()
        .from(table.NAME, 'f')
        .field('f.*')
        .where(`tf.${colsTrailersFiles.TRAILER_ID} = '${trailerId}'`);

    setLabelsArrFilter(exp, labelsArr);

    return exp
        .left_join(tableTrailersFiles.NAME, 'tf', `tf.${colsTrailersFiles.FILE_ID} = f.id`)
        .toString();
};

const selectFilesByUserIdAndLabels = (userId, fileLabels) => {
    const exp = squelPostgres
        .select()
        .from(table.NAME, 'f')
        .field('f.*')
        .where(`uf.${colsUsersFiles.USER_ID} = '${userId}'`);
    setLabelsArrFilter(exp, fileLabels);
    return exp
        .left_join(tableUsersFiles.NAME, 'uf', `uf.${colsCompaniesFiles.FILE_ID} = f.id`)
        .toString();
};

const selectFilesByUserId = userId => squelPostgres
    .select()
    .from(table.NAME, 'f')
    .where(`uf.${colsUsersFiles.USER_ID} = '${userId}'`)
    .left_join(tableUsersFiles.NAME, 'uf', `uf.${colsUsersFiles.FILE_ID} = f.id`)
    .toString();

const selectFilesByCarId = carId => squelPostgres
    .select()
    .from(table.NAME, 'f')
    .where(`cf.${colsCarsFiles.CAR_ID} = '${carId}'`)
    .left_join(tableCarsFiles.NAME, 'cf', `cf.${colsCarsFiles.FILE_ID} = f.id`)
    .toString();

const selectFilesByTrailerId = trailerId => squelPostgres
    .select()
    .from(table.NAME, 'f')
    .where(`tf.${colsTrailersFiles.TRAILER_ID} = '${trailerId}'`)
    .left_join(tableTrailersFiles.NAME, 'tf', `tf.${colsTrailersFiles.FILE_ID} = f.id`)
    .toString();

const selectFilesByDriverIdAndLabels = (driverId, labelsArr) => {
    const exp = squelPostgres
        .select()
        .field('f.*')
        .from(table.NAME, 'f')
        .where(`d.id = '${driverId}'`);

    setLabelsArrFilter(exp, labelsArr);
    return exp
        .left_join(tableUsersFiles.NAME, 'uf', `uf.${colsUsersFiles.FILE_ID} = f.id`)
        .left_join(tableDrivers.NAME, 'd', `d.${colsDrivers.USER_ID} = uf.${colsUsersFiles.USER_ID}`)
        .toString();
};

const setLabelsArrFilter = (exp, labelsArr) => {
    const innerExp = squel
        .expr()
        .and(`f.${cols.LABELS} = ARRAY[${labelsArr[0].map(label => `'${label}'`).toString()}]`);

    labelsArr.forEach((labels, i) => {
        if (i) {
            innerExp
                .or(`f.${cols.LABELS} = ARRAY[${labels.map(label => `'${label}'`).toString()}]`);
        }
    });

    exp.where(innerExp);
};

module.exports = {
    insertFiles,
    deleteFilesByIds,
    selectFilesByCompanyId,
    selectFilesByCompanyIdAndLabel,
    selectFilesByCompanyIdAndLabels,
    selectFilesByCarIdAndLabels,
    selectFilesByCarIdAndArrayLabels,
    selectFilesByTrailerIdAndLabels,
    selectFilesByTrailerIdAndArrayLabels,
    selectFilesByUserIdAndLabels,
    selectFilesByUserId,
    selectFilesByDriverIdAndLabels,
    selectFilesByCarId,
    selectFilesByTrailerId,
};
