const  { many } = require('db');

// sql-helpers
const {
    selectRecords,
} = require('sql-helpers/currency-priorities');

const getRecords = () => many(selectRecords());

module.exports = {
    getRecords,
};
