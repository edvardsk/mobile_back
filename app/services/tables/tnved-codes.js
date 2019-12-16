const  { manyOrNone } = require('db');

// sql-helpers
const {
    selectRecords,
} = require('sql-helpers/tnved-codes');

const getRecords = () => manyOrNone(selectRecords());

module.exports = {
    getRecords,
};
