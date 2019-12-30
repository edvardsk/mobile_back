// sql-helpers
const {
    insertRecords,
    insertRecord,
} = require('sql-helpers/deal-points-info');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = values => [insertRecords(values), OPERATIONS.MANY];

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

module.exports = {
    addRecordsAsTransaction,
    addRecordAsTransaction,
};
