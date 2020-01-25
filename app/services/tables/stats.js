const { one, oneOrNone } = require('db');
const {
    insertStats,
    selectStats,
    selectStatsByUser,
    updateStats,
} = require('sql-helpers/stats');

const { OPERATIONS } = require('constants/postgres');

const getStatsByUserId = userId => oneOrNone(selectStatsByUser(userId));

const addStats = data => one(insertStats(data));
const putStats = (id, data) => one(updateStats(id, data));

const getStats = id => oneOrNone(selectStats(id));

const addRecordsAsTransaction = data => [insertStats(data), OPERATIONS.ONE];

const updateRecordsAsTransaction = (id, data) => [updateStats(id, data), OPERATIONS.ONE];

module.exports = {
    getStatsByUserId,
    addStats,
    putStats,
    getStats,

    addRecordsAsTransaction,
    updateRecordsAsTransaction,
};
