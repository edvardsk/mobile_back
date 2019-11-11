const { manyOrNone } = require('db');

// sql-helpers
const {
    insertRecords,
    selectFilesByUserId,
    deleteRecordsByFileIds,
} = require('sql-helpers/users-to-files');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = data => [insertRecords(data), OPERATIONS.MANY_OR_NONE];

const getFilesByCompanyId = userId => manyOrNone(selectFilesByUserId(userId));

const removeRecordsByFileIdsAsTransaction = fileIds => [deleteRecordsByFileIds(fileIds), OPERATIONS.MANY_OR_NONE];

module.exports = {
    addRecordsAsTransaction,
    getFilesByCompanyId,
    removeRecordsByFileIdsAsTransaction,
};
