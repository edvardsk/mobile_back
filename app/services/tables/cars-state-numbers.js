const { one } = require('db');

// sql-helpers
const {
    insertRecord,
    updateActiveRecordsByCarId,
    selectActiveRecordByCarId,
} = require('sql-helpers/cars-state-numbers');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

const editActiveRecordsByCarIdAsTransaction = (carId, data) => [updateActiveRecordsByCarId(carId, data), OPERATIONS.MANY];

const getActiveRecordByCarIdStrict = carId => one(selectActiveRecordByCarId(carId));

module.exports = {
    addRecordAsTransaction,
    editActiveRecordsByCarIdAsTransaction,

    getActiveRecordByCarIdStrict,
};
