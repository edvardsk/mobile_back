const { manyOrNone } = require('db');

// sql-helpers
const {
    insertRecords,
    selectFilesByCompanyId,
    selectFilesByCompanyIdAndLabels,
    deleteRecordsByCompanyId,
    deleteRecordsByFileIds,
} = require('sql-helpers/companies-to-files');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = data => [insertRecords(data), OPERATIONS.MANY_OR_NONE];

const getFilesByCompanyId = companyId => manyOrNone(selectFilesByCompanyId(companyId));

const getFilesByCompanyIdAndLabels = (companyId, labels) => manyOrNone(selectFilesByCompanyIdAndLabels(companyId, labels));

const removeRecordsByCompanyIdAsTransaction = companyId => [deleteRecordsByCompanyId(companyId), OPERATIONS.MANY_OR_NONE];

const removeRecordsByFileIdsAsTransaction = fileIds => [deleteRecordsByFileIds(fileIds), OPERATIONS.MANY_OR_NONE];

module.exports = {
    addRecordsAsTransaction,
    getFilesByCompanyId,
    getFilesByCompanyIdAndLabels,
    removeRecordsByCompanyIdAsTransaction,
    removeRecordsByFileIdsAsTransaction,
};
