const { one, manyOrNone } = require('db');

// sql-helpers
const {
    selectRecordByUserId,
    insertRecord,
    selectRecordByTwoUsersIds,
} = require('sql-helpers/users-to-companies');

// constants
const { OPERATIONS } = require('constants/postgres');

const getRecordByUserIdStrict = userId => one(selectRecordByUserId(userId));

const isUsersFromOneCompany = (user1, user2) => manyOrNone(selectRecordByTwoUsersIds(user1, user2))
    .then(records => records.length === 2);

const addRecordAsTransaction = data => [insertRecord(data), OPERATIONS.ONE];

module.exports = {
    getRecordByUserIdStrict,
    addRecordAsTransaction,
    isUsersFromOneCompany,
};
