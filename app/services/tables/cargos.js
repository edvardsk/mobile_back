const { one, oneOrNone, manyOrNone } = require('db');

// sql-helpers
const {
    insertRecord,
    updateRecordById,
    deleteRecordById,
    selectRecordById,
    selectRecordByIdLight,
    selectRecordsByCompanyId,
    selectCargosByCompanyIdPaginationSorting,
    selectCountCargosByCompanyId,
} = require('sql-helpers/cargos');

// constants
const { OPERATIONS } = require('constants/postgres');
const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.CARGOS.COLUMNS;

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

const editRecordAsTransaction = (id, data) => [updateRecordById(id, data), OPERATIONS.ONE];

const removeRecordAsTransaction = id => [deleteRecordById(id), OPERATIONS.ONE];

const getRecord = id => oneOrNone(selectRecordById(id));

const getRecordLight = id => oneOrNone(selectRecordByIdLight(id));

const getRecordStrict = id => one(selectRecordById(id));

const getRecordsByCompanyId = companyId => manyOrNone(selectRecordsByCompanyId(companyId));

const getCargosPaginationSorting = (companyId, limit, offset, sortColumn, asc, filter) => (
    manyOrNone(selectCargosByCompanyIdPaginationSorting(companyId, limit, offset, sortColumn, asc, filter))
);

const getCountCargos = (companyId, filter) => (
    one(selectCountCargosByCompanyId(companyId, filter))
        .then(({ count }) => +count)
);

const checkCargoInCompanyExists = async (meta, cargoId) => {
    const cargo = await getRecordLight(cargoId);
    const { companyId } = meta;
    return cargo && cargo[cols.COMPANY_ID] === companyId;
};

module.exports = {
    addRecordAsTransaction,
    editRecordAsTransaction,
    removeRecordAsTransaction,
    getRecord,
    getRecordStrict,
    getRecordsByCompanyId,
    getCargosPaginationSorting,
    getCountCargos,

    checkCargoInCompanyExists,
};