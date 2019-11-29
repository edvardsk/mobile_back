const { one } = require('db');

// sql-helpers
const {
    insertRecord,
    updateActiveRecordsByTrailerId,
    selectActiveRecordByTrailerId,
} = require('sql-helpers/trailers-state-numbers');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

const editActiveRecordsByTrailerIdAsTransaction = (trailerId, data) => [updateActiveRecordsByTrailerId(trailerId, data), OPERATIONS.MANY];

const getActiveRecordByTrailerIdStrict = trailerId => one(selectActiveRecordByTrailerId(trailerId));

module.exports = {
    addRecordAsTransaction,
    editActiveRecordsByTrailerIdAsTransaction,

    getActiveRecordByTrailerIdStrict,
};
