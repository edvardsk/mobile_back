const { oneOrNone } = require('db');

// sql-helpers
const {
    insertRecord,
    deleteRecordById,
    updateRecordById,
    updateRecordByCarId,
    selectRecordByCarId,
    selectRecordById,
} = require('sql-helpers/deal-cars');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

const removeRecordAsTransaction = id => [deleteRecordById(id), OPERATIONS.ONE];

const editRecordAsTransaction = (id, values) => [updateRecordById(id, values), OPERATIONS.ONE];

const editRecordByCarIdAsTransaction = (carId, values) => [updateRecordByCarId(carId, values), OPERATIONS.ONE];

const getRecordByCarId = carId => oneOrNone(selectRecordByCarId(carId));

const getRecord = id => oneOrNone(selectRecordById(id));

module.exports = {
    addRecordAsTransaction,
    editRecordAsTransaction,
    editRecordByCarIdAsTransaction,
    removeRecordAsTransaction,
    getRecord,
    getRecordByCarId,
};
