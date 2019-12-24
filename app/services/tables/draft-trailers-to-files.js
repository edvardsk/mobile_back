const { manyOrNone } = require('db');

// sql-helpers
const {
    insertRecords,
    selectFilesByDraftTrailerId,
    deleteRecordsByFileIds,
} = require('sql-helpers/draft-trailers-to-files');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = data => [insertRecords(data), OPERATIONS.MANY_OR_NONE];

const getFilesByDraftTrailerId = draftTrailerId => manyOrNone(selectFilesByDraftTrailerId(draftTrailerId));

const removeRecordsByFileIdsAsTransaction = fileIds => [deleteRecordsByFileIds(fileIds), OPERATIONS.MANY_OR_NONE];

module.exports = {
    addRecordsAsTransaction,
    getFilesByDraftTrailerId,
    removeRecordsByFileIdsAsTransaction,
};
