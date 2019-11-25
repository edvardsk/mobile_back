const { one, oneOrNone, manyOrNone } = require('db');

// sql-helpers
const {
    insertRecord,
    selectCarsByCompanyIdPaginationSorting,
    selectCountCarsByCompanyId,
    selectRecordByStateNumberAndActive,
} = require('sql-helpers/cars');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

const getCarsPaginationSorting = (companyId, limit, offset, sortColumn, asc, filter) => (
    manyOrNone(selectCarsByCompanyIdPaginationSorting(companyId, limit, offset, sortColumn, asc, filter))
);

const getCountCars = (companyId, filter) => (
    one(selectCountCarsByCompanyId(companyId, filter))
        .then(({ count }) => +count)
);

const getRecordByStateNumberAndActive = stateNumber => oneOrNone(selectRecordByStateNumberAndActive(stateNumber));

const checkCarStateNumberExistsOpposite = async (meta, stateNumber) => {
    const car = await getRecordByStateNumberAndActive(stateNumber);
    return !car;
};

module.exports = {
    addRecordAsTransaction,
    getCarsPaginationSorting,
    getCountCars,

    checkCarStateNumberExistsOpposite,
};
