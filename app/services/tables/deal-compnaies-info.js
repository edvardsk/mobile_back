// sql-helpers
const {
    insertRecords,
} = require('sql-helpers/deal-companies-info');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = data => [insertRecords(data), OPERATIONS.MANY];

module.exports = {
    addRecordsAsTransaction,
};
