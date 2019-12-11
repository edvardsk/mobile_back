const { one, oneOrNone, manyOrNone } = require('db');

// sql-helpers
const {
    insertRecord,
    updateRecordById,
    updateRecordDecreaseFreeCountById,
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

const getRecordsForSearch = (coordinates, dates, searchRadius, languageId, companyId, filter) => {
    return manyOrNone(selectRecordsForSearch(coordinates, dates, searchRadius, languageId, companyId, filter));
};

const getAllNewRecordsForSearch = (languageId, companyId) => {
    return manyOrNone(selectAllNewRecordsForSearch(languageId, companyId));
};

const getAvailableCargosByIds = (ids, busyStatusesNames) => manyOrNone(selectAvailableCargosByIds(ids, busyStatusesNames));

const checkCargoInCompanyExists = async (meta, cargoId) => {
    const cargo = await getRecordLight(cargoId);
    const { companyId } = meta;
    return cargo && cargo[cols.COMPANY_ID] === companyId;
};

const checkCargoExists = async (meta, cargoId) => {
    const cargo = await getRecordLight(cargoId);
    return !!cargo;
};

module.exports = {
    addRecordAsTransaction,
    editRecordAsTransaction,
    editRecordDecreaseFreeCountAsTransaction,
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
};
