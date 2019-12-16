const { manyOrNone } = require('db');

// sql-helpers
const {
    insertRecord,
    selectRecords,
    selectRecordsByTNVEDId,
} = require('sql-helpers/tnved-codes-keywords');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

const getRecords = () => manyOrNone(selectRecords());
const getRecordsByTNVEDId = id => manyOrNone(selectRecordsByTNVEDId(id));

module.exports = {
    addRecordAsTransaction,
    getRecords,
    getRecordsByTNVEDId,
};
