const { oneOrNone, manyOrNone } = require('db');

// sql-helpers
const {
    selectRecords,
    selectRecordById,
    selectRecordsByLanguageAndKeyword,
} = require('sql-helpers/tnved-codes');

const getRecord = id => oneOrNone(selectRecordById(id));

const getRecords = () => manyOrNone(selectRecords());

const getRecordsByLanguageAndKeyword = (languageId, filter) => manyOrNone(selectRecordsByLanguageAndKeyword(languageId, filter));

const checkRecordExists = async (schema, id) => {
    const tnvedCode = await getRecord(id);
    return !!tnvedCode;
};

module.exports = {
    getRecord,
    getRecords,
    getRecordsByLanguageAndKeyword,
    checkRecordExists,
};
