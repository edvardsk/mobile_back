const { oneOrNone } = require('db');
const {
    insertRecord,
    selectRecordByHash,
    deleteRecordById,
    deleteRecordByHash,
    deleteRecordsByUserId,
} = require('sql-helpers/tracking-socket-hashes');

const { OPERATIONS } = require('constants/postgres');

const getRecordByHash = hash => oneOrNone(selectRecordByHash(hash));

const removeRecordByHash = hash => oneOrNone(deleteRecordByHash(hash));

const removeRecord = id => oneOrNone(deleteRecordById(id));

const removeRecordsByUserAsTransaction = id => [deleteRecordsByUserId(id), OPERATIONS.MANY_OR_NONE];

const addRecordAsTransaction = data => [insertRecord(data), OPERATIONS.ONE];

module.exports = {
    getRecordByHash,
    removeRecordByHash,
    removeRecord,
    removeRecordsByUserAsTransaction,
    addRecordAsTransaction,
};
