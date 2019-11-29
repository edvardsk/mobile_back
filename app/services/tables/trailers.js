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
} = require('sql-helpers/trailers');

// services
const DangerClassesService = require('./danger-classes');

// constants
const { OPERATIONS } = require('constants/postgres');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

// helpers
const { isDangerous } = require('helpers/danger-classes');

const colsCars = SQL_TABLES.CARS.COLUMNS;
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

const markAsDeleted = id => editRecord(id, {
    [colsCars.DELETED]: true,
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


module.exports = {
    addRecordAsTransaction,
    editRecordAsTransaction,

    getRecordStrict,
    getTrailersPaginationSorting,
    getCountTrailers,
    getRecordFullStrict,
    markAsDeleted,

    checkTrailerStateNumberExistsOpposite,
    checkIsPassedFileWithDangerClass,
};
