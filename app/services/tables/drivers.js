const { one, oneOrNone, manyOrNone } = require('db');

// sql-helpers
const {
    insertRecord,
    selectRecordByUserId,
    updateRecordByUserId,
    selectAvailableDriversPaginationSorting,
    selectCountAvailableDrivers,
} = require('sql-helpers/drivers');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

const editDriverAsTransaction = (userId, values) => [updateRecordByUserId(userId, values), OPERATIONS.ONE];

const getRecordByUserId = userId => oneOrNone(selectRecordByUserId(userId));

const getAvailableDriversPaginationSorting = (companyId, limit, offset, sortColumn, asc, filter) => (
    manyOrNone(selectAvailableDriversPaginationSorting(companyId, limit, offset, sortColumn, asc, filter))
);

const getCountAvailableDrivers = (companyId, filter) => (
    one(selectCountAvailableDrivers(companyId, filter))
        .then(({ count }) => +count)
);

module.exports = {
    addRecordAsTransaction,
    editDriverAsTransaction,
    getRecordByUserId,
    getAvailableDriversPaginationSorting,
    getCountAvailableDrivers,
};
