// sql-helpers
const {
    insertRecords,
    insertRecord,
} = require('sql-helpers/deal-sub-statuses-history');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = values => [insertRecords(values), OPERATIONS.MANY];

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

module.exports = {
    addRecordsAsTransaction,
    addRecordAsTransaction,
};
