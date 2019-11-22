const { one, manyOrNone } = require('db');

// sql-helpers
const {
    insertRecord,
    selectCarsByCompanyIdPaginationSorting,
    selectCountCarsByCompanyId,
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

module.exports = {
    addRecordAsTransaction,
    getCarsPaginationSorting,
    getCountCars,
};
