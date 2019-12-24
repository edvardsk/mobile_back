// sql-helpers
const {
    insertRecord,
    deleteRecordsByCarId,
} = require('sql-helpers/car-latest-points');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordAsTransaction = value => [insertRecord(value), OPERATIONS.ONE];

const deleteRecordByCarIdAsTransaction = carId => [deleteRecordsByCarId(carId), OPERATIONS.ONE];

const addWithReplacement = (carId, record) => [
    deleteRecordByCarIdAsTransaction(carId),
    addRecordAsTransaction(record),
];

module.exports = {
    addRecordAsTransaction,
    addWithReplacement,
};
