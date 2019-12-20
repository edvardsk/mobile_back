const { manyOrNone } = require('db');

// sql-helpers
const {
    insertRecords,
    selectFilesByDraftCarId,
    deleteRecordsByFileIds,
} = require('sql-helpers/draft-cars-to-files');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = data => [insertRecords(data), OPERATIONS.MANY_OR_NONE];

const getFilesByDraftCarId = draftCarId => manyOrNone(selectFilesByDraftCarId(draftCarId));

const removeRecordsByFileIdsAsTransaction = fileIds => [deleteRecordsByFileIds(fileIds), OPERATIONS.MANY_OR_NONE];

module.exports = {
    addRecordsAsTransaction,
    getFilesByDraftCarId,
    removeRecordsByFileIdsAsTransaction,
};
