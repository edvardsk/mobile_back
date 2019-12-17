const  { manyOrNone } = require('db');

// sql-helpers
const {
    selectRecords,
    selectRecordsByLanguageAndKeyword,
} = require('sql-helpers/tnved-codes');

const getRecords = () => manyOrNone(selectRecords());

const getRecordsByLanguageAndKeyword = (languageId, filter) => manyOrNone(selectRecordsByLanguageAndKeyword(languageId, filter));

module.exports = {
    getRecords,
    getRecordsByLanguageAndKeyword,
};
