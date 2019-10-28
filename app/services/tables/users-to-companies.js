const { one } = require('db');

// sql-helpers
const {
    selectRecordByUserId,
    insertRecord,
} = require('sql-helpers/users-to-companies');

// constants
const { OPERATIONS } = require('constants/postgres');

const getRecordByUserIdStrict = userId => one(selectRecordByUserId(userId));

const addRecordAsTransaction = data => [insertRecord(data), OPERATIONS.ONE];

module.exports = {
    getRecordByUserIdStrict,
    addRecordAsTransaction,
};
