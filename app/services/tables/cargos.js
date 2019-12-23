const { one, oneOrNone, manyOrNone } = require('db');

// sql-helpers
const {
    insertRecord,
    updateRecordById,
    updateRecordDecreaseFreeCountById,
    updateRecordIncreaseFreeCountById,
    deleteRecordById,
    selectRecordById,
    selectRecordByWithCoordinatesId,
    selectRecordByIdWithCoordinatesAndEconomicSettings,
    selectRecordByIdLight,
    selectRecordsByCompanyId,
    selectCargosByCompanyIdPaginationSorting,
    selectCountCargosByCompanyId,
    selectRecordsForSearch,
    selectAllNewRecordsForSearch,
    selectAvailableCargosByIds,
} = require('sql-helpers/cargos');

// constants
const { OPERATIONS } = require('constants/postgres');
const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.CARGOS.COLUMNS;

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

const editRecordAsTransaction = (id, data) => [updateRecordById(id, data), OPERATIONS.ONE];

const editRecordDecreaseFreeCountAsTransaction = (id, value) => [updateRecordDecreaseFreeCountById(id, value), OPERATIONS.ONE];

const editRecordIncreaseFreeCountAsTransaction = (id, value) => [updateRecordIncreaseFreeCountById(id, value), OPERATIONS.ONE];

const editRecord = (id, data) => one(updateRecordById(id, data));

const removeRecordAsTransaction = id => [deleteRecordById(id), OPERATIONS.ONE];

const getRecord = id => oneOrNone(selectRecordById(id));

const getRecordLight = id => oneOrNone(selectRecordByIdLight(id));

const getRecordStrict = (id, userLanguageId) => one(selectRecordByWithCoordinatesId(id, userLanguageId));

const getRecordStrictWithEconomicSettings = (id, userLanguageId) => one(selectRecordByIdWithCoordinatesAndEconomicSettings(id, userLanguageId));

const getRecordsByCompanyId = companyId => manyOrNone(selectRecordsByCompanyId(companyId));

const getCargosPaginationSorting = (companyId, limit, offset, sortColumn, asc, filter, userLanguageId) => (
    manyOrNone(selectCargosByCompanyIdPaginationSorting(companyId, limit, offset, sortColumn, asc, filter, userLanguageId))
);

const getCountCargos = (companyId, filter) => (
    one(selectCountCargosByCompanyId(companyId, filter))
        .then(({ count }) => +count)
);

const markAsDeleted = id => editRecord(id, {
    [cols.DELETED]: true,
});

const getRecordsForSearch = (coordinates, dates, searchRadius, languageId, companyId, showMyCargos, filter) => {
    return manyOrNone(selectRecordsForSearch(coordinates, dates, searchRadius, languageId, companyId, showMyCargos, filter));
};

const getAllNewRecordsForSearch = (languageId, companyId, showMyCargos) => {
    return manyOrNone(selectAllNewRecordsForSearch(languageId, companyId, showMyCargos));
};

const getAvailableCargosByIds = (ids) => manyOrNone(selectAvailableCargosByIds(ids));

const checkCargoInCompanyExists = async (meta, cargoId) => {
    const cargo = await getRecordLight(cargoId);
    const { companyId } = meta;
    return cargo && cargo[cols.COMPANY_ID] === companyId;
};

const checkCargoExists = async (meta, cargoId) => {
    const cargo = await getRecordLight(cargoId);
    return !!cargo;
};

const checkFreeCargoExists = async (meta, cargoId) => {
    const cargo = await getRecordLight(cargoId);
    return !!cargo && cargo[cols.FREE_COUNT] > 0;
};

module.exports = {
    addRecordAsTransaction,
    editRecordAsTransaction,
    editRecordDecreaseFreeCountAsTransaction,
    editRecordIncreaseFreeCountAsTransaction,
    removeRecordAsTransaction,
    getRecord,
    getRecordStrict,
    getRecordsByCompanyId,
    getCargosPaginationSorting,
    getCountCargos,
    markAsDeleted,
    getRecordsForSearch,
    getAllNewRecordsForSearch,
    getRecordStrictWithEconomicSettings,
    getAvailableCargosByIds,

    checkCargoInCompanyExists,
    checkCargoExists,
    checkFreeCargoExists,
};
