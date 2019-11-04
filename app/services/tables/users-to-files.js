const { manyOrNone } = require('db');

// sql-helpers
const {
    insertRecords,
    selectFilesByUserId,
    deleteRecordsByUserId,
} = require('sql-helpers/users-to-files');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = data => [insertRecords(data), OPERATIONS.MANY_OR_NONE];

const getFilesByCompanyId = userId => manyOrNone(selectFilesByUserId(userId));

const removeRecordsByCompanyIdAsTransaction = userId => [deleteRecordsByUserId(userId), OPERATIONS.MANY_OR_NONE];

module.exports = {
    addRecordsAsTransaction,
    getFilesByCompanyId,
    removeRecordsByCompanyIdAsTransaction,
};
