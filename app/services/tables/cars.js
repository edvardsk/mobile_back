const { one, oneOrNone, manyOrNone } = require('db');

// sql-helpers
const {
    insertRecord,
    updateRecord,
    selectRecordById,
    selectCarsByCompanyIdPaginationSorting,
    selectCountCarsByCompanyId,
    selectRecordByStateNumberAndActive,
    selectRecordByIdAndCompanyIdLight,
    selectRecordByIdFull,
    selectRecordByIdAndCompanyIdWithoutTrailer,
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

const editRecordAsTransaction = (id, data) => [updateRecord(id, data), OPERATIONS.ONE];

const editRecord = (id, data) => one(updateRecord(id, data));

const getRecordStrict = id => one(selectRecordById(id));

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

const getRecordByIdAndCompanyIdWithoutTrailer = (id, companyId) => oneOrNone(selectRecordByIdAndCompanyIdWithoutTrailer(id, companyId));

const markAsDeleted = id => editRecord(id, {
    [colsCars.DELETED]: true,
});

const markAsDeletedAsTransaction = id => [updateRecord(id, {
    [colsCars.DELETED]: true,
}), OPERATIONS.ONE];

const checkCarStateNumberExistsOpposite = async (meta, stateNumber) => {
    const { carId } = meta;
    const car = await getRecordByStateNumberAndActive(stateNumber);
    return !car || car.id === carId;
};

const checkCarInCompanyExist = async (meta, id) => {
    const { companyId } = meta;
    const car = await getRecordByIdAndCompanyIdLight(id, companyId);
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
    const carType = car[colsCars.CAR_TYPE];

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
};

module.exports = {
    addRecordAsTransaction,
    editRecordAsTransaction,

    getRecordStrict,
    getCarsPaginationSorting,
    getCountCars,
    getRecordFullStrict,
    markAsDeleted,
    markAsDeletedAsTransaction,

    checkCarStateNumberExistsOpposite,
    checkCarInCompanyExist,
    checkIsCarInCompanyWithoutTrailerExists,
    checkIsPassedFileWithDangerClass,
    checkIsPassedFileWithNewDangerClass,
};
