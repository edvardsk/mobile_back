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
} = require('sql-helpers/cars');

// constants
const { OPERATIONS } = require('constants/postgres');
const { SQL_TABLES } = require('constants/tables');
const { DOCUMENTS } = require('constants/files');

const colsCars = SQL_TABLES.CARS.COLUMNS;

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

const markAsDeleted = id => editRecord(id, {
    [colsCars.DELETED]: true,
});

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

const checkIsPassedFileWithNewDangerClass = async (meta, dangerClassId, schema, key, data) => {
    const { carId } = meta;
    const car = await getRecordStrict(carId);
    const dangerClassIdFromDb = car[colsCars.CAR_DANGER_CLASS_ID];
    const dangerClassFile = data[DOCUMENTS.DANGER_CLASS];

    return !(dangerClassId && dangerClassId !== dangerClassIdFromDb && !dangerClassFile);
};

module.exports = {
    addRecordAsTransaction,
    editRecordAsTransaction,

    getRecordStrict,
    getCarsPaginationSorting,
    getCountCars,
    getRecordFullStrict,
    markAsDeleted,

    checkCarStateNumberExistsOpposite,
    checkCarInCompanyExist,
    checkIsPassedFileWithNewDangerClass,
};
