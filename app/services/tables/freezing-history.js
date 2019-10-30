const { one } = require('db');

// sql-helpers
const {
    insertRecord,
} = require('sql-helpers/freezing-history');

const addRecord = value => one(insertRecord(value));

module.exports = {
    addRecord,
};
