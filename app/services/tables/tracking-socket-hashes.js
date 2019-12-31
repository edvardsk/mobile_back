const { oneOrNone } = require('db');
const {
    insertRecord,
    selectRecordByHash,
    deleteRecordById,
    deleteRecordsByUserId,
} = require('sql-helpers/tracking-socket-hashes');

const { OPERATIONS } = require('constants/postgres');

const getRecordByHash = hash => oneOrNone(selectRecordByHash(hash));

const deleteRecord = id => oneOrNone(deleteRecordById(id));

const deleteRecordsByUser = userId => [deleteRecordsByUserId(userId), OPERATIONS.MANY_OR_NONE];

const addRecordAsTransaction = data => [insertRecord(data), OPERATIONS.ONE];

module.exports = {
    getRecordByHash,
    deleteRecord,
    addRecordAsTransaction,
    deleteRecordsByUser,
};
