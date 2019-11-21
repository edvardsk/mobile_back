const { manyOrNone } = require('db');

// sql-helpers
const {
    insertRecords,
    selectRecordsByPoints,
} = require('sql-helpers/points');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = values => [insertRecords(values), OPERATIONS.MANY];

const getRecordsByPoints = points => manyOrNone(selectRecordsByPoints(points));

module.exports = {
    addRecordsAsTransaction,
    getRecordsByPoints,
};
