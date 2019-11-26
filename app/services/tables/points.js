const { one, manyOrNone } = require('db');

// sql-helpers
const {
    insertRecords,
    selectRecordsByPoints,
    selectRecordById,
} = require('sql-helpers/points');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = values => [insertRecords(values), OPERATIONS.MANY];

const getRecordsByPoints = points => manyOrNone(selectRecordsByPoints(points));

const getRecordStrict = id => one(selectRecordById(id));

module.exports = {
    addRecordsAsTransaction,
    getRecordsByPoints,
    getRecordStrict,
};
