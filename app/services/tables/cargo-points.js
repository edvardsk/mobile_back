const { many } = require('db');

// sql-helpers
const {
    insertRecords,
    deleteRecordsByCargoId,
    selectRecordsByCargoId,
} = require('sql-helpers/cargo-points');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = values => [insertRecords(values), OPERATIONS.MANY];

const removeRecordsByCargoIdAsTransaction = cargoId => [deleteRecordsByCargoId(cargoId), OPERATIONS.MANY_OR_NONE];

const getRecordsByCargoId = cargoId => many(selectRecordsByCargoId(cargoId));

module.exports = {
    addRecordsAsTransaction,
    removeRecordsByCargoIdAsTransaction,
    getRecordsByCargoId,
};
