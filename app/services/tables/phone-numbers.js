const { one } = require('db');
const {
    insertRecord
} = require('sql-helpers/phone-numbers');

// constants
const { OPERATIONS } = require('constants/postgres');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

// services
const PhonePrefixesService = require('./phone-prefixes');

// helpers
const { isValidPhoneNumber } = require('helpers/validators/phone-number');

const colsPhonePrefixes = SQL_TABLES.PHONE_PREFIXES.COLUMNS;

const addRecord = values => one(insertRecord(values));

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

const checkPhoneNumberValid = async (props, number, schema, key, data) => {
    const phonePrefixId = data[HOMELESS_COLUMNS.PHONE_PREFIX_ID];
    const phonePrefixRecord = await PhonePrefixesService.getRecord(phonePrefixId);
    if (!phonePrefixRecord) {
        return true; // will be caught other validator
    }
    const phonePrefixName = phonePrefixRecord[colsPhonePrefixes.PREFIX];

    return isValidPhoneNumber(number, phonePrefixName);
};

module.exports = {
    addRecord,
    addRecordAsTransaction,
    checkPhoneNumberValid,
};
