// const { oneOrNone } = require('db');

// sql-helpers
const {
    insertRecords,
    deleteRecordsByCargoId,
} = require('sql-helpers/cargo-points');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = values => [insertRecords(values), OPERATIONS.MANY];

const removeRecordsByCargoIdAsTransaction = cargoId => [deleteRecordsByCargoId(cargoId), OPERATIONS.MANY_OR_NONE];

module.exports = {
    addRecordsAsTransaction,
    removeRecordsByCargoIdAsTransaction,
};
