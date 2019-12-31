const { manyOrNone } = require('db');

// sql-helpers
const {
    insertRecords,
    selectFilesByDealCarId,
    deleteRecordsByFileIds,
} = require('sql-helpers/deal-cars-to-deal-files');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = data => [insertRecords(data), OPERATIONS.MANY_OR_NONE];

const getFilesByDraftCarId = dealCarId => manyOrNone(selectFilesByDealCarId(dealCarId));

const removeRecordsByFileIdsAsTransaction = fileIds => [deleteRecordsByFileIds(fileIds), OPERATIONS.MANY_OR_NONE];

module.exports = {
    addRecordsAsTransaction,
    getFilesByDraftCarId,
    removeRecordsByFileIdsAsTransaction,
};
