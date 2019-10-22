const { manyOrNone } = require('db');

// sql-helpers
const {
    insertRecords,
    deleteRecordsByCompanyId,
} = require('sql-helpers/routes');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = data => [insertRecords(data), OPERATIONS.MANY_OR_NONE];

const addRecords = data => manyOrNone(insertRecords(data));

const removeRecordsByCompanyIdAsTransaction = companyId => [deleteRecordsByCompanyId(companyId), OPERATIONS.MANY_OR_NONE];

const removeRecordsByCompanyId = companyId => manyOrNone(deleteRecordsByCompanyId(companyId));

module.exports = {
    addRecordsAsTransaction,
    addRecords,
    removeRecordsByCompanyIdAsTransaction,
    removeRecordsByCompanyId,
};
