// sql-helpers
const {
    insertRecord,
} = require('sql-helpers/users-to-companies');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordAsTransaction = data => [insertRecord(data), OPERATIONS.ONE];

module.exports = {
    addRecordAsTransaction,
};
