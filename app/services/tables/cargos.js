// const { oneOrNone } = require('db');

// sql-helpers
const {
    insertRecord,
} = require('sql-helpers/cargos');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

module.exports = {
    addRecordAsTransaction,
};
