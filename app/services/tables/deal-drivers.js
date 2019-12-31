const { oneOrNone } = require('db');

// sql-helpers
const {
    insertRecord,
    updateRecordByDriverId,
    updateRecord,
    selectRecordByDriverId,
    selectRecordByUserId,
    selectRecordById,
    deleteRecordById,
} = require('sql-helpers/deal-drivers');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

const removeRecordAsTransaction = id => [deleteRecordById(id), OPERATIONS.ONE];

const editRecordByDriverIdAsTransaction = (driverId, values) => [updateRecordByDriverId(driverId, values), OPERATIONS.ONE];

const editRecordAsTransaction = (id, values) => [updateRecord(id, values), OPERATIONS.ONE];

const getRecordByDriverId = driverId => oneOrNone(selectRecordByDriverId(driverId));

const getRecordByUserId = userId => oneOrNone(selectRecordByUserId(userId));

const getRecord = id => oneOrNone(selectRecordById(id));

module.exports = {
    addRecordAsTransaction,
    editRecordByDriverIdAsTransaction,
    removeRecordAsTransaction,
    editRecordAsTransaction,
    getRecordByDriverId,
    getRecordByUserId,
    getRecord,
};
