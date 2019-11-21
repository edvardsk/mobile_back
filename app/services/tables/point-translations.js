const { one } = require('db');

// sql-helpers
const {
    insertRecords,
    insertRecord,
} = require('sql-helpers/point-translations');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = values => [insertRecords(values), OPERATIONS.MANY];

const addRecord = value => one(insertRecord(value));

module.exports = {
    addRecordsAsTransaction,
    addRecord,
};
