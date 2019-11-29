// sql-helpers
const {
    insertRecords,
    deleteRecordsByCargoId,
} = require('sql-helpers/cargo-prices');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = values => [insertRecords(values), OPERATIONS.MANY];

const removeRecordsByCargoIdAsTransaction = cargoId => [deleteRecordsByCargoId(cargoId), OPERATIONS.MANY_OR_NONE];

module.exports = {
    addRecordsAsTransaction,
    removeRecordsByCargoIdAsTransaction,
};
