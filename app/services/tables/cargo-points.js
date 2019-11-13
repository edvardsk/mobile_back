// const { oneOrNone } = require('db');

// sql-helpers
const {
    insertRecords,
} = require('sql-helpers/cargo-points');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = values => [insertRecords(values), OPERATIONS.MANY];

module.exports = {
    addRecordsAsTransaction,
};
