const { one, oneOrNone } = require('db');
const {
    insertRecord,
    selectRecordByHash,
    deleteRecordById,
    updateRecordById,
    selectLatestRecordByUserEmail,
    selectLatestRecordByUserId,
} = require('sql-helpers/email-confirmation-hashes');

const { OPERATIONS } = require('constants/postgres');

const addRecord = data => one(insertRecord(data));

const getRecordByHash = hash => oneOrNone(selectRecordByHash(hash));

const deleteRecord = id => one(deleteRecordById(id));

const addRecordAsTransaction = data => [insertRecord(data), OPERATIONS.ONE];

const updateRecordAsTransaction = (id, data) => [updateRecordById(id, data), OPERATIONS.ONE];

const getLatestHashByUserEmailStrict = email => one(selectLatestRecordByUserEmail(email));

const getLatestHashByUserIdlStrict = userId => one(selectLatestRecordByUserId(userId));

module.exports = {
    addRecord,
    getRecordByHash,
    deleteRecord,
    addRecordAsTransaction,
    updateRecordAsTransaction,
    getLatestHashByUserEmailStrict,
    getLatestHashByUserIdlStrict,
};
