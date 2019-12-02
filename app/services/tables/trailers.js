const { one, oneOrNone, manyOrNone } = require('db');

// sql-helpers
const {
    insertRecord,
    updateRecord,
    selectRecordById,
    selectTrailersByCompanyIdPaginationSorting,
    selectCountTrailersByCompanyId,
    selectRecordByStateNumberAndActive,
    selectRecordByIdFull,
    selectRecordByIdAndCompanyIdLight,
} = require('sql-helpers/trailers');

// services
const DangerClassesService = require('./danger-classes');

// constants
const { OPERATIONS } = require('constants/postgres');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { DOCUMENTS } = require('constants/files');

// helpers
const { isDangerous } = require('helpers/danger-classes');

const colsTrailers = SQL_TABLES.TRAILERS.COLUMNS;
const colsDangerClasses = SQL_TABLES.DANGER_CLASSES.COLUMNS;

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

const editRecordAsTransaction = (id, data) => [updateRecord(id, data), OPERATIONS.ONE];

const editRecord = (id, data) => one(updateRecord(id, data));

const getRecordStrict = id => one(selectRecordById(id));

const getTrailersPaginationSorting = (companyId, limit, offset, sortColumn, asc, filter) => (
    manyOrNone(selectTrailersByCompanyIdPaginationSorting(companyId, limit, offset, sortColumn, asc, filter))
);

const getCountTrailers = (companyId, filter) => (
    one(selectCountTrailersByCompanyId(companyId, filter))
        .then(({ count }) => +count)
);

const getRecordByStateNumberAndActive = stateNumber => oneOrNone(selectRecordByStateNumberAndActive(stateNumber));

const getRecordFullStrict = id => one(selectRecordByIdFull(id));

const getRecordByIdAndCompanyIdLight = (id, companyId) => oneOrNone(selectRecordByIdAndCompanyIdLight(id, companyId));

const markAsDeleted = id => editRecord(id, {
    [colsTrailers.DELETED]: true,
});

const linkTrailerAndCar = (trailerId, carId) => editRecord(trailerId, {
    [colsTrailers.CAR_ID]: carId,
});

const checkTrailerStateNumberExistsOpposite = async (meta, stateNumber) => {
    const { trailerId } = meta;
    const trailer = await getRecordByStateNumberAndActive(stateNumber);
    return !trailer || trailer.id === trailerId;
};

const checkIsPassedFileWithDangerClass = async (meta, dangerClassId, schema, key, data) => {
    const dangerClassFromDb = await DangerClassesService.getRecordStrict(dangerClassId);
    const dangerClassName = dangerClassFromDb[colsDangerClasses.NAME];

    const dangerClassFile = data[HOMELESS_COLUMNS.TRAILER_DANGER_CLASS];

    return (!isDangerous(dangerClassName) && !dangerClassFile) ||
        (isDangerous(dangerClassName) && dangerClassFile);
};

const checkTrailerInCompanyExists = async (meta, id) => {
    const { companyId } = meta;
    const trailer = await getRecordByIdAndCompanyIdLight(id, companyId);
    return !!trailer;
};

const checkTrailerWithoutCarInCompanyExists = async (meta, id) => {
    const { companyId } = meta;
    const trailer = await getRecordByIdAndCompanyIdLight(id, companyId);
    return !!(trailer && !trailer[colsTrailers.CAR_ID]);
};

const checkIsPassedFileWithNewDangerClass = async (meta, newDangerClassId, schema, key, data) => {
    const { trailerId } = meta;
    const dangerClassFile = data[DOCUMENTS.DANGER_CLASS];

    const trailer = await getRecordStrict(trailerId);
    const oldDangerClassId = trailer[colsTrailers.TRAILER_DANGER_CLASS_ID];

    const [oldDangerClass, newDangerClass] = await Promise.all([
        DangerClassesService.getRecordStrict(oldDangerClassId),
        DangerClassesService.getRecordStrict(newDangerClassId),
    ]);

    const olsDangerClassName = oldDangerClass[colsDangerClasses.NAME];
    const newDangerClassName = newDangerClass[colsDangerClasses.NAME];

    return !(
        (!isDangerous(olsDangerClassName) && isDangerous(newDangerClassName) && !dangerClassFile) ||
        (!isDangerous(olsDangerClassName) && !isDangerous(newDangerClassName) && dangerClassFile) ||
        (isDangerous(olsDangerClassName) && !isDangerous(newDangerClassName) && dangerClassFile)
    );
};

module.exports = {
    addRecordAsTransaction,
    editRecordAsTransaction,

    getRecordStrict,
    getTrailersPaginationSorting,
    getCountTrailers,
    getRecordFullStrict,
    markAsDeleted,
    linkTrailerAndCar,

    checkTrailerStateNumberExistsOpposite,
    checkIsPassedFileWithDangerClass,
    checkTrailerInCompanyExists,
    checkTrailerWithoutCarInCompanyExists,
    checkIsPassedFileWithNewDangerClass,
};
