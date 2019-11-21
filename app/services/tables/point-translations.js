// sql-helpers
const {
    insertRecords,
} = require('sql-helpers/point-translations');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = values => [insertRecords(values), OPERATIONS.MANY];

module.exports = {
    addRecordsAsTransaction,
};
