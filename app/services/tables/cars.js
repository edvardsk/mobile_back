const { one, oneOrNone, manyOrNone } = require('db');

// sql-helpers
const {
    insertRecord,
    insertRecords,
    updateRecord,
    selectRecordById,
    selectRecordWithActiveDealsById,
    selectRecordByIdWithDeleted,
    selectCarsByCompanyIdPaginationSorting,
    selectCountCarsByCompanyId,
    selectRecordByStateNumberAndActive,
    selectRecordByIdAndCompanyIdLight,
    selectRecordByIdFull,
    selectRecordByIdAndCompanyIdWithoutTrailer,
    selectAvailableCarsByCompanyIdPaginationSorting,
    selectCountAvailableCarsByCompanyId,
    selectAvailableCarsByIdsAndCompanyId,
    selectAvailableCarByIdAndCompanyId,
    selectRecordsByStateNumbers,
    selectRecordsForSearch,
    selectAllNewRecordsForSearch,
} = require('sql-helpers/cars');

// services
const DangerClassesService = require('./danger-classes');

// constants
const { OPERATIONS } = require('constants/postgres');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { DOCUMENTS } = require('constants/files');
const { CAR_TYPES_MAP } = require('constants/cars');

// helpers
const { isDangerous } = require('helpers/danger-classes');

const colsCars = SQL_TABLES.CARS.COLUMNS;
const colsDangerClasses = SQL_TABLES.DANGER_CLASSES.COLUMNS;

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

const addRecordsAsTransaction = values => [insertRecords(values), OPERATIONS.MANY];

const editRecordAsTransaction = (id, data) => [updateRecord(id, data), OPERATIONS.ONE];

const editRecord = (id, data) => one(updateRecord(id, data));

const getRecordStrict = id => one(selectRecordById(id));

const getRecord = id => oneOrNone(selectRecordById(id));

const getRecordWithActiveDeals = id => oneOrNone(selectRecordWithActiveDealsById(id));

const getCarsPaginationSorting = (companyId, limit, offset, sortColumn, asc, filter) => (
    manyOrNone(selectCarsByCompanyIdPaginationSorting(companyId, limit, offset, sortColumn, asc, filter))
);

const getCountCars = (companyId, filter) => (
    one(selectCountCarsByCompanyId(companyId, filter))
        .then(({ count }) => +count)
);

const getRecordByStateNumberAndActive = stateNumber => oneOrNone(selectRecordByStateNumberAndActive(stateNumber));

const getRecordByIdAndCompanyIdLight = (id, companyId) => oneOrNone(selectRecordByIdAndCompanyIdLight(id, companyId));

const getRecordFullStrict = id => one(selectRecordByIdFull(id));

const getRecordStrictWithDeleted = id => one(selectRecordByIdWithDeleted(id));

const getRecordByIdAndCompanyIdWithoutTrailer = (id, companyId) => oneOrNone(selectRecordByIdAndCompanyIdWithoutTrailer(id, companyId));

const markAsDeleted = id => editRecord(id, {
    [colsCars.DELETED]: true,
});

const markAsDeletedAsTransaction = id => [updateRecord(id, {
    [colsCars.DELETED]: true,
}), OPERATIONS.ONE];

const getAvailableCarsByCompanyIdPaginationSorting = (companyId, cargoDates, limit, offset, sortColumn, asc, filter) => (
    manyOrNone(selectAvailableCarsByCompanyIdPaginationSorting(companyId, cargoDates, limit, offset, sortColumn, asc, filter))
);

const getCountAvailableCars = (companyId, cargoDates, filter) => (
    one(selectCountAvailableCarsByCompanyId(companyId, cargoDates, filter))
        .then(({ count }) => +count)
);

const getAvailableCarsByIdsAndCompanyId = (ids, companyId) => (
    manyOrNone(selectAvailableCarsByIdsAndCompanyId(ids, companyId))
);

const getAvailableCarByIdAndCompanyId = (id, companyId, cargoDates, checkExternalCars = false) => (
    oneOrNone(selectAvailableCarByIdAndCompanyId(id, companyId, cargoDates, checkExternalCars))
);

const getRecordsByStateNumbers = numbers => (
    manyOrNone(selectRecordsByStateNumbers(numbers))
);

const getRecordsForSearch = (coordinates, companyId, showMyCars, searchRadius, filter) => (
    manyOrNone(selectRecordsForSearch(coordinates, companyId, showMyCars, searchRadius, filter))
);

const getAllNewRecordsForSearch = (companyId, showMyCars) => (
    manyOrNone(selectAllNewRecordsForSearch(companyId, showMyCars))
);

const checkCarStateNumberExistsOpposite = async (meta, stateNumber) => {
    const { carId } = meta;
    const car = await getRecordByStateNumberAndActive(stateNumber.toUpperCase());
    return !car || car.id === carId;
};

const checkCarInCompanyExist = async (meta, id) => {
    const { companyId } = meta;
    const car = await getRecordByIdAndCompanyIdLight(id, companyId);
    return !!car;
};

const checkCarExist = async (meta, id) => {
    const car = await getRecord(id);
    return !!car;
};

const checkIsCarInCompanyWithoutTrailerExists = async (meta, id) => {
    const { companyId } = meta;
    const carWithoutTrailer = await getRecordByIdAndCompanyIdWithoutTrailer(id, companyId);
    return !!carWithoutTrailer;
};

const checkIsPassedFileWithDangerClass = async (meta, dangerClassId, schema, key, data) => {
    const dangerClassFromDb = await DangerClassesService.getRecordStrict(dangerClassId);
    const dangerClassName = dangerClassFromDb[colsDangerClasses.NAME];

    const dangerClassFile = data[HOMELESS_COLUMNS.CAR_DANGER_CLASS];

    return (!isDangerous(dangerClassName) && !dangerClassFile) ||
        (isDangerous(dangerClassName) && dangerClassFile);
};

const checkIsPassedFileWithNewDangerClass = async (meta, newDangerClassId, schema, key, data) => {
    const { carId } = meta;
    const dangerClassFile = data[DOCUMENTS.DANGER_CLASS];
    const newCarType = data[colsCars.CAR_TYPE];
    if (newCarType === CAR_TYPES_MAP.QUAD) {
        return !dangerClassFile;
    }
    const car = await getRecordStrict(carId);

    const isShadow = car[colsCars.SHADOW];
    const carType = car[colsCars.CAR_TYPE];

    if (isShadow) {
        if (carType === CAR_TYPES_MAP.QUAD) {
            return !dangerClassFile;
        } else {
            const newDangerClass = await DangerClassesService.getRecordStrict(newDangerClassId);
            const newDangerClassName = newDangerClass[colsDangerClasses.NAME];
            return (
                (!isDangerous(newDangerClassName) && !dangerClassFile) ||
                (isDangerous(newDangerClassName) && dangerClassFile)
            );
        }
    } else {
        if (carType === CAR_TYPES_MAP.QUAD) {
            const newDangerClass = await DangerClassesService.getRecordStrict(newDangerClassId);
            const newDangerClassName = newDangerClass[colsDangerClasses.NAME];
            return (
                (!isDangerous(newDangerClassName) && !dangerClassFile) ||
                (isDangerous(newDangerClassName) && dangerClassFile)
            );
        } else {
            const oldDangerClassId = car[colsCars.CAR_DANGER_CLASS_ID];
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
        }
    }

};

module.exports = {
    addRecordAsTransaction,
    addRecordsAsTransaction,
    editRecordAsTransaction,

    getRecordStrict,
    getCarsPaginationSorting,
    getCountCars,
    getRecord,
    getRecordWithActiveDeals,
    getRecordFullStrict,
    getRecordStrictWithDeleted,
    markAsDeleted,
    markAsDeletedAsTransaction,
    getAvailableCarsByCompanyIdPaginationSorting,
    getCountAvailableCars,
    getAvailableCarsByIdsAndCompanyId,
    getAvailableCarByIdAndCompanyId,
    getRecordsByStateNumbers,
    getRecordsForSearch,
    getAllNewRecordsForSearch,

    checkCarStateNumberExistsOpposite,
    checkCarInCompanyExist,
    checkCarExist,
    checkIsCarInCompanyWithoutTrailerExists,
    checkIsPassedFileWithDangerClass,
    checkIsPassedFileWithNewDangerClass,
};
