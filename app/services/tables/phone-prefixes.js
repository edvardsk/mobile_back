const { manyOrNone, oneOrNone } = require('db');
const {
    selectRecords,
    selectRecordById,
} = require('sql-helpers/phone-prefixes');

// helpers
const { isValidUUID } = require('helpers/validators');

const getRecords = () => manyOrNone(selectRecords());

const getRecord = id => oneOrNone(selectRecordById(id));

const checkPhonePrefixExists = async (schema, id) => {
    if (!isValidUUID(id)) {
        return null;
    }
    const prefix = await getRecord(id);
    return !!prefix;
};

module.exports = {
    getRecords,
    getRecord,
    checkPhonePrefixExists,
};
