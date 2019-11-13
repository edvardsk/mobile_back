const { one, oneOrNone, manyOrNone } = require('db');

// sql-helpers
const {
    selectRecordByName,
    selectRecords,
} = require('sql-helpers/cargo-statuses');

const getRecordByName = name => oneOrNone(selectRecordByName(name));

const getRecordByNameStrict = name => one(selectRecordByName(name));

const getRecords = () => manyOrNone(selectRecords());

module.exports = {
    getRecordByName,
    getRecordByNameStrict,
    getRecords,
};
