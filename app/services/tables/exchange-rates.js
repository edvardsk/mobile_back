const  { manyOrNone } = require('db');

// sql-helpers
const {
    selectRecordsByCountriesIds,
    insertRecords,
} = require('sql-helpers/exchange-rates');

const getRecordsByCountriesIds = ids => manyOrNone(selectRecordsByCountriesIds(ids));

const addRecords = values => manyOrNone(insertRecords(values));

module.exports = {
    getRecordsByCountriesIds,
    addRecords,
};
