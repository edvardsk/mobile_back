const { one } = require('db');
const {
    insertRecord
} = require('sql-helpers/phone-numbers');
const { OPERATIONS } = require('constants/postgres');

const addRecord = values => one(insertRecord(values));

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

module.exports = {
    addRecord,
    addRecordAsTransaction,
};
