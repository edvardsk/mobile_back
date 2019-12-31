const { manyOrNone } = require('db');

// sql-helpers
const {
    insertRecords,
    selectFilesByDealTrailerId,
    deleteRecordsByFileIds,
} = require('sql-helpers/deal-trailers-to-deal-files');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = data => [insertRecords(data), OPERATIONS.MANY_OR_NONE];

const removeRecordsByFileIdsAsTransaction = fileIds => [deleteRecordsByFileIds(fileIds), OPERATIONS.MANY_OR_NONE];

const getFilesByDraftTrailerId = dealTrailerId => manyOrNone(selectFilesByDealTrailerId(dealTrailerId));

module.exports = {
    addRecordsAsTransaction,
    getFilesByDraftTrailerId,
    removeRecordsByFileIdsAsTransaction,
};
