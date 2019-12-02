// sql-helpers
const {
    insertRecords,
    deleteRecordsByFileIds,
} = require('sql-helpers/trailers-to-files');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = data => [insertRecords(data), OPERATIONS.MANY_OR_NONE];

const removeRecordsByFileIdsAsTransaction = fileIds => [deleteRecordsByFileIds(fileIds), OPERATIONS.MANY_OR_NONE];

module.exports = {
    addRecordsAsTransaction,
    removeRecordsByFileIdsAsTransaction,
};
