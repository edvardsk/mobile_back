const { one } = require('db');

// sql-helpers
const {
    selectRecordByNameAndDealId,
    deleteRecordByNameAndDealId,
} = require('sql-helpers/pg-jobs');

// constants
const { OPERATIONS } = require('constants/postgres');

const removeRecordByNameAndDataPathAsTransaction = (name, path) => [deleteRecordByNameAndDealId(name, path), OPERATIONS.ONE_OR_NONE];

const getRecordByNameAndDealId = (name, dealId) => one(selectRecordByNameAndDealId(name, dealId));

module.exports = {
    removeRecordByNameAndDataPathAsTransaction,
    getRecordByNameAndDealId,
};
