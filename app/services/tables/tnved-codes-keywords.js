const { one, manyOrNone } = require('db');

// sql-helpers
const {
    insertRecord,
    selectRecords,
    selectRecordsByTNVEDId,
    deleteRecordByKeywordId,
} = require('sql-helpers/tnved-codes-keywords');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

const getRecords = () => manyOrNone(selectRecords());
const getRecordsByTNVEDId = id => manyOrNone(selectRecordsByTNVEDId(id));

const removeRecordByKeywordId = keywordId => one(deleteRecordByKeywordId(keywordId));

module.exports = {
    addRecordAsTransaction,
    getRecords,
    getRecordsByTNVEDId,
    removeRecordByKeywordId,
};
