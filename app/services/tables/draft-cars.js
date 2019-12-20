const { one, oneOrNone } = require('db');

// sql-helpers
const {
    insertRecord,
    deleteRecordById,
    updateRecordById,
    updateRecordByCarId,
    updateRecordAppendCommentsById,
    selectRecordByCarId,
    selectRecordById,
} = require('sql-helpers/draft-cars');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

const removeRecordAsTransaction = id => [deleteRecordById(id), OPERATIONS.ONE];

const editRecordAsTransaction = (id, values) => [updateRecordById(id, values), OPERATIONS.ONE];

const editRecordByCarIdAsTransaction = (carId, values) => [updateRecordByCarId(carId, values), OPERATIONS.ONE];

const getRecordByCarId = carId => oneOrNone(selectRecordByCarId(carId));

const getRecord = id => oneOrNone(selectRecordById(id));

const addComments = (id, comments) => one(updateRecordAppendCommentsById(id, comments));

module.exports = {
    addRecordAsTransaction,
    editRecordAsTransaction,
    editRecordByCarIdAsTransaction,
    removeRecordAsTransaction,
    getRecord,
    getRecordByCarId,
    addComments,
};
