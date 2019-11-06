const { oneOrNone } = require('db');

// sql-helpers
const {
    insertRecord,
    selectRecordByUserId,
} = require('sql-helpers/drivers');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

const getRecordByUserId = userId => oneOrNone(selectRecordByUserId(userId));

module.exports = {
    addRecordAsTransaction,
    getRecordByUserId,
};
