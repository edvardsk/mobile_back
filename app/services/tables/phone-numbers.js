const { one, oneOrNone } = require('db');
const {
    insertRecord,
    getRecordByPhoneNumber,
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

const getRecordByNumber = number => oneOrNone(getRecordByPhoneNumber(number));

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

const checkPhoneNumberExists = async (props, number, schema, currentPropsName, data) => {
    const colsPhoneNumbers = SQL_TABLES.PHONE_NUMBERS.COLUMNS;
    const prefixId = data[HOMELESS_COLUMNS.PHONE_PREFIX_ID];

    const phoneFromDb = await getRecordByNumber(number);

    return !(phoneFromDb && phoneFromDb[colsPhoneNumbers.PHONE_PREFIX_ID] === prefixId);
};

const checkPhoneNumberValid = async (props, number, schema, key, data) => {
    const phonePrefixId = data[HOMELESS_COLUMNS.PHONE_PREFIX_ID];
    const phonePrefixRecord = await PhonePrefixesService.getRecord(phonePrefixId);
    const phonePrefixName = phonePrefixRecord[colsPhonePrefixes.PREFIX];

    return isValidPhoneNumber(number, phonePrefixName);
};

module.exports = {
    addRecord,
    addRecordAsTransaction,
    checkPhoneNumberExists,
    checkPhoneNumberValid,
};
