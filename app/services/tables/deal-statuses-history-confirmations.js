// sql-helpers
const {
    insertRecords,
    insertRecord,
    updateRecordById,
} = require('sql-helpers/deal-statuses-history-confirmations');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = values => [insertRecords(values), OPERATIONS.MANY];

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

const editRecordAsTransaction = (id, value) => [updateRecordById(id, value), OPERATIONS.ONE];

module.exports = {
    addRecordsAsTransaction,
    addRecordAsTransaction,
    editRecordAsTransaction,
};
