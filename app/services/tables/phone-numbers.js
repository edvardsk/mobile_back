const { one, oneOrNone } = require('db');
const {
    insertRecord,
    selectRecordByPhoneNumberAndPrefixId,
    updateRecordByUserId,
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

const getRecordByNumberAndPrefixId = (number, prefixId) => oneOrNone(selectRecordByPhoneNumberAndPrefixId(number, prefixId));

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

const editRecordAsTransaction = (userId, values) => [updateRecordByUserId(userId, values), OPERATIONS.ONE];

const checkPhoneNumberExists = async (meta, number, schema, currentPropsName, data) => {
    const colsPhoneNumbers = SQL_TABLES.PHONE_NUMBERS.COLUMNS;
    const prefixId = data[HOMELESS_COLUMNS.PHONE_PREFIX_ID];

    const phoneFromDb = await getRecordByNumberAndPrefixId(number, prefixId);
    const { userId } = meta;

    return !phoneFromDb || (phoneFromDb && phoneFromDb[colsPhoneNumbers.USER_ID] === userId);
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
    editRecordAsTransaction,

    checkPhoneNumberExists,
    checkPhoneNumberValid,
};
