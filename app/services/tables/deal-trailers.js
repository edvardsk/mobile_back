const { one, oneOrNone } = require('db');

// sql-helpers
const {
    insertRecord,
    updateRecordByTrailerId,
    updateRecordById,
    deleteRecordById,
    selectRecordById,
    selectRecordByTrailerId,
} = require('sql-helpers/deal-trailers');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

const removeRecordAsTransaction = id => [deleteRecordById(id), OPERATIONS.ONE];

const editRecordAsTransaction = (id, values) => [updateRecordById(id, values), OPERATIONS.ONE];

const editRecordByTrailerIdAsTransaction = (trailerId, values) => [updateRecordByTrailerId(trailerId, values), OPERATIONS.ONE];

const getRecordByTrailerId = trailerId => oneOrNone(selectRecordByTrailerId(trailerId));

const getRecordByTrailerIdStrict = trailerId => one(selectRecordByTrailerId(trailerId));

const getRecord = id => oneOrNone(selectRecordById(id));

module.exports = {
    addRecordAsTransaction,
    editRecordAsTransaction,
    editRecordByTrailerIdAsTransaction,
    removeRecordAsTransaction,
    getRecord,
    getRecordByTrailerId,
    getRecordByTrailerIdStrict,
};
