const { manyOrNone } = require('db');

// sql-helpers
const {
    insertRecords,
    selectFilesByDraftDriverId,
    deleteRecordsByFileIds,
} = require('sql-helpers/draft-drivers-to-files');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = data => [insertRecords(data), OPERATIONS.MANY_OR_NONE];

const getFilesByDraftDriverId = draftDriverId => manyOrNone(selectFilesByDraftDriverId(draftDriverId));

const removeRecordsByFileIdsAsTransaction = fileIds => [deleteRecordsByFileIds(fileIds), OPERATIONS.MANY_OR_NONE];

module.exports = {
    addRecordsAsTransaction,
    getFilesByDraftDriverId,
    removeRecordsByFileIdsAsTransaction,
};
