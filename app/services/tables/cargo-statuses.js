const { oneOrNone } = require('db');

// sql-helpers
const {
    selectRecordByName,
} = require('sql-helpers/cargo-statuses');

const getRecordByName = name => oneOrNone(selectRecordByName(name));

const getRecordByNameStrict = name => oneOrNone(selectRecordByName(name));

module.exports = {
    getRecordByName,
    getRecordByNameStrict,
};
