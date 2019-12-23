const { one, oneOrNone } = require('db');

// sql-helpers
const {
    insertRecord,
    updateRecordByTrailerId,
    updateRecordById,
    deleteRecordById,
    updateRecordAppendCommentsById,
    selectRecordById,
    selectRecordByTrailerId,
} = require('sql-helpers/draft-trailers');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

const removeRecordAsTransaction = id => [deleteRecordById(id), OPERATIONS.ONE];

const editRecordAsTransaction = (id, values) => [updateRecordById(id, values), OPERATIONS.ONE];

const editRecordByTrailerIdAsTransaction = (trailerId, values) => [updateRecordByTrailerId(trailerId, values), OPERATIONS.ONE];

const getRecordByTrailerId = trailerId => oneOrNone(selectRecordByTrailerId(trailerId));

const getRecord = id => oneOrNone(selectRecordById(id));

const addComments = (id, comments) => one(updateRecordAppendCommentsById(id, comments));

module.exports = {
    addRecordAsTransaction,
    editRecordAsTransaction,
    editRecordByTrailerIdAsTransaction,
    removeRecordAsTransaction,
    getRecord,
    getRecordByTrailerId,
    addComments,
};
