// sql-helpers
const {
    insertRecords,
    deleteRecordsByCompanyId,
} = require('sql-helpers/other-organizations');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = values => [insertRecords(values), OPERATIONS.MANY_OR_NONE];

const removeRecordsByCompanyIdAsTransaction = companyId => [deleteRecordsByCompanyId(companyId), OPERATIONS.MANY_OR_NONE];

module.exports = {
    addRecordsAsTransaction,
    removeRecordsByCompanyIdAsTransaction,
};
