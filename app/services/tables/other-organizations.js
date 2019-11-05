const { manyOrNone } = require('db');

// sql-helpers
const {
    insertRecords,
    deleteRecordsByCompanyId,
    selectRecordsByCompanyId,
} = require('sql-helpers/other-organizations');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = values => [insertRecords(values), OPERATIONS.MANY_OR_NONE];

const removeRecordsByCompanyIdAsTransaction = companyId => [deleteRecordsByCompanyId(companyId), OPERATIONS.MANY_OR_NONE];

const getRecordsByCompanyId = companyId => manyOrNone(selectRecordsByCompanyId(companyId));

module.exports = {
    addRecordsAsTransaction,
    removeRecordsByCompanyIdAsTransaction,
    getRecordsByCompanyId,
};
