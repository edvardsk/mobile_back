const { one } = require('db');

// sql-helpers
const {
    insertRecord,
    insertRecords,
    updateActiveRecordsByCarId,
    selectActiveRecordByCarId,
} = require('sql-helpers/cars-state-numbers');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

const addRecordsAsTransaction = values => [insertRecords(values), OPERATIONS.MANY];

const editActiveRecordsByCarIdAsTransaction = (carId, data) => [updateActiveRecordsByCarId(carId, data), OPERATIONS.MANY];

const getActiveRecordByCarIdStrict = carId => one(selectActiveRecordByCarId(carId));

module.exports = {
    addRecordAsTransaction,
    addRecordsAsTransaction,
    editActiveRecordsByCarIdAsTransaction,

    getActiveRecordByCarIdStrict,
};
