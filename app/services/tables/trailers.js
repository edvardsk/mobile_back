const { one, oneOrNone, manyOrNone } = require('db');

// sql-helpers
const {
    insertRecord,
    updateRecord,
    updateRecordByCarId,
    selectRecordById,
    selectTrailersByCompanyIdPaginationSorting,
    selectCountTrailersByCompanyId,
    selectRecordByStateNumberAndActive,
    selectRecordByIdFull,
    selectRecordByIdAndCompanyIdLight,
    selectAvailableTrailersByCompanyIdPaginationSorting,
    selectAvailableCountTrailersByCompanyId,
    selectAvailableTrailersByIdsAndCompanyId,
    selectAvailableTrailerByIdAndCompanyId,
    selectRecordsByStateNumbers,
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

const unlinkTrailerFromCarByCarIdAsTransaction = carId => [updateRecordByCarId(carId, {
    [colsTrailers.CAR_ID]: null,
}), OPERATIONS.ONE_OR_NONE];

const unlinkTrailerFromCarAsTransaction = trailerId => [updateRecord(trailerId, {
    [colsTrailers.CAR_ID]: null,
}), OPERATIONS.ONE_OR_NONE];

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

const markAsDeletedAsTransaction = id => [updateRecord(id, {
    [colsTrailers.DELETED]: true,
}), OPERATIONS.ONE];

const linkTrailerAndCar = (trailerId, carId) => editRecord(trailerId, {
    [colsTrailers.CAR_ID]: carId,
});

const unlinkTrailerFromCar = id => editRecord(id, {
    [colsTrailers.CAR_ID]: null,
});

const getAvailableTrailersPaginationSorting = (companyId, limit, offset, sortColumn, asc, filter) => (
    manyOrNone(selectAvailableTrailersByCompanyIdPaginationSorting(companyId, limit, offset, sortColumn, asc, filter))
);

const getCountAvailableTrailers = (companyId, filter) => (
    one(selectAvailableCountTrailersByCompanyId(companyId, filter))
        .then(({ count }) => +count)
);

const getAvailableTrailersByIdsAndCompanyId = (ids, companyId) => (
    manyOrNone(selectAvailableTrailersByIdsAndCompanyId(ids, companyId))
);

const getAvailableTrailerByIdAndCompanyId = (id, companyId) => (
    oneOrNone(selectAvailableTrailerByIdAndCompanyId(id, companyId))
);

const getRecordsByStateNumbers = numbers => (
    manyOrNone(selectRecordsByStateNumbers(numbers))
);

const checkTrailerStateNumberExistsOpposite = async (meta, stateNumber) => {
    const { trailerId } = meta;
    const trailer = await getRecordByStateNumberAndActive(stateNumber.toUpperCase());
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

const checkTrailerWithCarInCompanyExists = async (meta, id) => {
    const { companyId } = meta;
    const trailer = await getRecordByIdAndCompanyIdLight(id, companyId);
    return !!(trailer && trailer[colsTrailers.CAR_ID]);
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
    unlinkTrailerFromCarByCarIdAsTransaction,
    unlinkTrailerFromCarAsTransaction,
    markAsDeletedAsTransaction,

    getRecordStrict,
    getTrailersPaginationSorting,
    getCountTrailers,
    getRecordFullStrict,
    markAsDeleted,
    linkTrailerAndCar,
    unlinkTrailerFromCar,
    getAvailableTrailersPaginationSorting,
    getCountAvailableTrailers,
    getAvailableTrailersByIdsAndCompanyId,
    getAvailableTrailerByIdAndCompanyId,
    getRecordsByStateNumbers,

    checkTrailerStateNumberExistsOpposite,
    checkIsPassedFileWithDangerClass,
    checkTrailerInCompanyExists,
    checkTrailerWithoutCarInCompanyExists,
    checkTrailerWithCarInCompanyExists,
    checkIsPassedFileWithNewDangerClass,
};
