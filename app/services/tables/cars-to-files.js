// sql-helpers
const {
    insertRecords,
} = require('sql-helpers/cars-to-files');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = data => [insertRecords(data), OPERATIONS.MANY_OR_NONE];

module.exports = {
    addRecordsAsTransaction,
};
