const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');
const { SqlArray } = require('constants/instances');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.DRAFT_FILES;
const tableDraftDriversFiles = SQL_TABLES.DRAFT_DRIVERS_TO_FILES;
const tableDraftDrivers = SQL_TABLES.DRAFT_DRIVERS;
const tableDrivers = SQL_TABLES.DRIVERS;
const tableCars = SQL_TABLES.CARS;
const tableDraftCars = SQL_TABLES.DRAFT_CARS;
const tableDraftCarsFiles = SQL_TABLES.DRAFT_CARS_TO_FILES;
const tableDraftTrailers = SQL_TABLES.DRAFT_TRAILERS;
const tableDraftTrailersFiles = SQL_TABLES.DRAFT_TRAILERS_TO_FILES;

const cols = table.COLUMNS;
const colsDraftDriversFiles = tableDraftDriversFiles.COLUMNS;
const colsDraftDrivers = tableDraftDrivers.COLUMNS;
const colsDrivers = tableDrivers.COLUMNS;
const colsDraftCars = tableDraftCars.COLUMNS;
const colsDraftCarsFiles = tableDraftCarsFiles.COLUMNS;
const colsDraftTrailers = tableDraftTrailers.COLUMNS;
const colsDraftTrailersFiles = tableDraftTrailersFiles.COLUMNS;

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

const selectFilesByDraftDriverIdAndLabels = (draftDriverId, labelsArr) => {
    const exp = squelPostgres
        .select()
        .from(table.NAME, 'f')
        .field('f.*')
        .where(`ddf.${colsDraftDriversFiles.DRAFT_DRIVER_ID} = '${draftDriverId}'`);
    setLabelsArrFilter(exp, labelsArr);
    return exp
        .left_join(tableDraftDriversFiles.NAME, 'ddf', `ddf.${colsDraftDriversFiles.DRAFT_FILE_ID} = f.id`)
        .toString();
};

const selectFilesByDraftDriverId = (draftDriverId) => squelPostgres
    .select()
    .from(table.NAME, 'f')
    .field('f.*')
    .where(`ddf.${colsDraftDriversFiles.DRAFT_DRIVER_ID} = '${draftDriverId}'`)
    .left_join(tableDraftDriversFiles.NAME, 'ddf', `ddf.${colsDraftDriversFiles.DRAFT_FILE_ID} = f.id`)
    .toString();

const selectFilesByCarIdAndLabels = (carId, labels) => squelPostgres
    .select()
    .from(table.NAME, 'f')
    .field('f.*')
    .where(`c.id = '${carId}'`)
    .where(`f.${cols.LABELS} && ARRAY[${labels.map(label => `'${label}'`).toString()}]`)
    .left_join(tableDraftCarsFiles.NAME, 'dcf', `dcf.${colsDraftCarsFiles.DRAFT_FILE_ID} = f.id`)
    .left_join(tableDraftCars.NAME, 'dc', `dc.id = dcf.${colsDraftCarsFiles.DRAFT_CAR_ID}`)
    .left_join(tableCars.NAME, 'c', `c.id = dc.${colsDraftCars.CAR_ID}`)
    .toString();

const selectFilesByTrailerIdAndLabels = (trailerId, labels) => squelPostgres
    .select()
    .from(table.NAME, 'f')
    .field('f.*')
    .where(`dt.${colsDraftTrailers.TRAILER_ID} = '${trailerId}'`)
    .where(`f.${cols.LABELS} && ARRAY[${labels.map(label => `'${label}'`).toString()}]`)
    .left_join(tableDraftTrailersFiles.NAME, 'dtf', `dtf.${colsDraftTrailersFiles.DRAFT_FILE_ID} = f.id`)
    .left_join(tableDraftTrailers.NAME, 'dt', `dt.id = dtf.${colsDraftTrailersFiles.DRAFT_TRAILER_ID}`)
    .toString();

const selectFilesByDraftCarId = (draftCarId) => squelPostgres
    .select()
    .from(table.NAME, 'f')
    .field('f.*')
    .where(`dcf.${colsDraftCarsFiles.DRAFT_CAR_ID} = '${draftCarId}'`)
    .left_join(tableDraftCarsFiles.NAME, 'dcf', `dcf.${colsDraftCarsFiles.DRAFT_FILE_ID} = f.id`)
    .toString();

const selectFilesByDraftTrailerId = (draftTrailerId) => squelPostgres
    .select()
    .from(table.NAME, 'f')
    .field('f.*')
    .where(`dtf.${colsDraftTrailersFiles.DRAFT_TRAILER_ID} = '${draftTrailerId}'`)
    .left_join(tableDraftTrailersFiles.NAME, 'dtf', `dtf.${colsDraftTrailersFiles.DRAFT_FILE_ID} = f.id`)
    .toString();

const selectFilesByUserId = (userId) => squelPostgres
    .select()
    .from(table.NAME, 'f')
    .field('f.*')
    .where(`d.${colsDrivers.USER_ID} = '${userId}'`)
    .left_join(tableDraftDriversFiles.NAME, 'ddf', `ddf.${colsDraftDriversFiles.DRAFT_FILE_ID} = f.id`)
    .left_join(tableDraftDrivers.NAME, 'dd', `dd.id = ddf.${colsDraftDriversFiles.DRAFT_DRIVER_ID}`)
    .left_join(tableDrivers.NAME, 'd', `d.id = dd.${colsDraftDrivers.DRIVER_ID}`)
    .toString();

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
    selectFilesByDraftDriverIdAndLabels,
    selectFilesByDraftDriverId,
    selectFilesByCarIdAndLabels,
    selectFilesByTrailerIdAndLabels,
    selectFilesByDraftCarId,
    selectFilesByDraftTrailerId,
    selectFilesByUserId,
};
