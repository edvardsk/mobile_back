const { manyOrNone, oneOrNone } = require('db');
const {
    selectRecords,
    selectRecordById,
} = require('sql-helpers/phone-prefixes');

const getRecords = () => manyOrNone(selectRecords());

const getRecord = id => oneOrNone(selectRecordById(id));

const checkPhonePrefixExists = async (schema, id) => {
    const prefix = getRecord(id);
    return !!prefix;
};

module.exports = {
    getRecords,
    getRecord,
    checkPhonePrefixExists,
};
