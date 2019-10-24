const { manyOrNone, oneOrNone } = require('db');
const {
    selectRecords,
    selectRecordById,
    selectRecordByCode,
} = require('sql-helpers/phone-prefixes');

const getRecords = () => manyOrNone(selectRecords());

const getRecord = id => oneOrNone(selectRecordById(id));

const getRecordByCode = code => oneOrNone(selectRecordByCode(code));

const checkPhonePrefixExistsOpposite = async (props, id) => {
    const prefix = await getRecord(id);
    return !!prefix;
};

module.exports = {
    getRecords,
    getRecord,
    getRecordByCode,
    checkPhonePrefixExistsOpposite,
};
