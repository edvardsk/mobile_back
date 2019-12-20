const { one, manyOrNone } = require('db');

// sql-helpers
const {
    insertRecord,
    selectRecords,
    selectRecordsByTNVEDIdAndLanguage,
    updateRecordByKeywordId,
    deleteRecordByKeywordId,
} = require('sql-helpers/tnved-codes-keywords');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

const getRecords = () => manyOrNone(selectRecords());
const getRecordsByTNVEDIdAndLanguage = (id, languageId) => manyOrNone(selectRecordsByTNVEDIdAndLanguage(id, languageId));

const editRecordByKeywordId = (keywordId, values) => one(updateRecordByKeywordId(keywordId, values));

const removeRecordByKeywordId = keywordId => one(deleteRecordByKeywordId(keywordId));

module.exports = {
    addRecordAsTransaction,
    getRecords,
    getRecordsByTNVEDIdAndLanguage,
    editRecordByKeywordId,
    removeRecordByKeywordId,
};