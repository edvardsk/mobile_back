const { one } = require('db');

// sql-helpers
const {
    insertRecord,
} = require('sql-helpers/freezing-history');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecord = value => one(insertRecord(value));

const addRecordAsTransaction = value => [insertRecord(value), OPERATIONS.ONE];

module.exports = {
    addRecord,
    addRecordAsTransaction,
};
