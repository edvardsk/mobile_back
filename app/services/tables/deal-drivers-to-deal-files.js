const { manyOrNone } = require('db');

// sql-helpers
const {
    insertRecords,
    selectFilesByDealDriverId,
    deleteRecordsByFileIds,
} = require('sql-helpers/deal-drivers-to-deal-files');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = data => [insertRecords(data), OPERATIONS.MANY_OR_NONE];

const getFilesByDraftDriverId = dealDriverId => manyOrNone(selectFilesByDealDriverId(dealDriverId));

const removeRecordsByFileIdsAsTransaction = fileIds => [deleteRecordsByFileIds(fileIds), OPERATIONS.MANY_OR_NONE];

module.exports = {
    addRecordsAsTransaction,
    getFilesByDraftDriverId,
    removeRecordsByFileIdsAsTransaction,
};
