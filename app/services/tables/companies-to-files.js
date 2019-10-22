const { manyOrNone } = require('db');

// sql-helpers
const {
    insertRecords,
    selectFilesByCompanyId,
    deleteRecordsByCompanyId,
} = require('sql-helpers/companies-to-files');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = data => [insertRecords(data), OPERATIONS.MANY_OR_NONE];

const getFilesByCompanyId = companyId => manyOrNone(selectFilesByCompanyId(companyId));

const removeRecordsByCompanyIdAsTransaction = companyId => [deleteRecordsByCompanyId(companyId), OPERATIONS.MANY_OR_NONE];

module.exports = {
    addRecordsAsTransaction,
    getFilesByCompanyId,
    removeRecordsByCompanyIdAsTransaction,
};
