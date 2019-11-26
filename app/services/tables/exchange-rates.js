const  { manyOrNone } = require('db');

// sql-helpers
const {
    selectRecordsByCountriesIds,
} = require('sql-helpers/exchange-rates');

const getRecordsByCountriesIds = ids => manyOrNone(selectRecordsByCountriesIds(ids));

module.exports = {
    getRecordsByCountriesIds,
};
