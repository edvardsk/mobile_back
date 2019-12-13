// sql-helpers
const {
    insertRecords,
} = require('sql-helpers/deal-statuses-history');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = values => [insertRecords(values), OPERATIONS.MANY];

module.exports = {
    addRecordsAsTransaction,
};
