const  { manyOrNone } = require('db');

// sql-helpers
const {
    selectRecordsByCountriesIds,
    insertRecords,
    deleteRecordsByCountryId,
} = require('sql-helpers/exchange-rates');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = values => [insertRecords(values), OPERATIONS.MANY];

const removeRecordsByCountryIdAsTransaction = countryId => [deleteRecordsByCountryId(countryId), OPERATIONS.MANY_OR_NONE];

const addRecords = values => manyOrNone(insertRecords(values));

const getRecordsByCountriesIds = ids => manyOrNone(selectRecordsByCountriesIds(ids));

module.exports = {
    addRecordsAsTransaction,
    removeRecordsByCountryIdAsTransaction,
    getRecordsByCountriesIds,
    addRecords,
};
