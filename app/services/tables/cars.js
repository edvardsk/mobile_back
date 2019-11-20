// sql-helpers
const {
    insertRecord,
} = require('sql-helpers/cars');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

module.exports = {
    addRecordAsTransaction,
};
