const  { many, manyOrNone } = require('db');

// sql-helpers
const {
    selectRecordsByCountriesIds,
    insertRecords,
    deleteRecordsByCountryId,
    selectRecordsByCountryId,
    selectRecords,
} = require('sql-helpers/exchange-rates');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = values => [insertRecords(values), OPERATIONS.MANY];

const removeRecordsByCountryIdAsTransaction = countryId => [deleteRecordsByCountryId(countryId), OPERATIONS.MANY_OR_NONE];

const addRecords = values => manyOrNone(insertRecords(values));

const getRecordsByCountriesIds = ids => manyOrNone(selectRecordsByCountriesIds(ids));

const getRecordsByCountryId = countryId => many(selectRecordsByCountryId(countryId));

const getRecords = () => manyOrNone(selectRecords());

module.exports = {
    addRecordsAsTransaction,
    removeRecordsByCountryIdAsTransaction,
    getRecordsByCountriesIds,
    addRecords,
    getRecordsByCountryId,
    getRecords,
};
