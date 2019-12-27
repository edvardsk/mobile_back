const { one, oneOrNone } = require('db');
const {
    insertRecord,
    selectRecordByHash,
    deleteRecordById,
} = require('sql-helpers/tracking-socket-hashes');

const { OPERATIONS } = require('constants/postgres');

const addRecord = data => one(insertRecord(data));

const getRecordByHash = hash => oneOrNone(selectRecordByHash(hash));

const deleteRecord = id => one(deleteRecordById(id));

const addRecordAsTransaction = data => [insertRecord(data), OPERATIONS.ONE];

module.exports = {
    addRecord,
    getRecordByHash,
    deleteRecord,
    addRecordAsTransaction,
};
