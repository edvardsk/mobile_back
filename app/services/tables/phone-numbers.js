const { one, oneOrNone } = require('db');
const {
    insertRecord,
    getRecordByPhoneNumber,
} = require('sql-helpers/phone-numbers');

// constants
const { OPERATIONS } = require('constants/postgres');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const addRecord = values => one(insertRecord(values));

const getRecordByNumber = number => oneOrNone(getRecordByPhoneNumber(number));

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

const checkPhoneNumberExists = async (props, number, schema, currentPropsName, data) => {
    const colsPhoneNumbers = SQL_TABLES.PHONE_NUMBERS.COLUMNS;
    const prefixId = data[HOMELESS_COLUMNS.PHONE_PREFIX_ID];

    const phoneFromDb = await getRecordByNumber(number);

    return !(phoneFromDb && phoneFromDb[colsPhoneNumbers.PHONE_PREFIX_ID] === prefixId);
};

module.exports = {
    addRecord,
    addRecordAsTransaction,
    checkPhoneNumberExists,
};
