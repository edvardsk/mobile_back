const { manyOrNone } = require('db');

// sql-helpers
const {
    insertRecords,
    deleteRecordsByFileIds,
    selectRecordsByCarId,
} = require('sql-helpers/cars-to-files');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = data => [insertRecords(data), OPERATIONS.MANY_OR_NONE];

const removeRecordsByFileIdsAsTransaction = fileIds => [deleteRecordsByFileIds(fileIds), OPERATIONS.MANY_OR_NONE];

const getRecordsByCarId = carId => manyOrNone(selectRecordsByCarId(carId));

module.exports = {
    addRecordsAsTransaction,
    removeRecordsByFileIdsAsTransaction,
    getRecordsByCarId,
};
