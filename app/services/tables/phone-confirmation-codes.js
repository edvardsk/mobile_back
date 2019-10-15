const { one, manyOrNone, oneOrNone } = require('db');
const cryptoRandomString = require('crypto-random-string');
const moment = require('moment');

// sql-helpers
const {
    insertRecord,
    selectRecordsByUserId,
    selectRecordsCountByUserId,
    selectLatestRecordsByUserId,
} = require('sql-helpers/phone-confirmation-codes');

// formatters
const { formatRecordToSave } = require('formatters/phone-confirmation');

const {
    PHONE_CONFIRMATION_CODE_LENGTH,
    PHONE_CONFIRMATION_EXPIRATION_UNIT,
    PHONE_CONFIRMATION_EXPIRATION_VALUE,
} = process.env;

const addRecord = values => one(insertRecord(values));

const getRecords = userId => manyOrNone(selectRecordsByUserId(userId));

const getRecordsCount = userId => oneOrNone(selectRecordsCountByUserId(userId))
    .then(({ count }) => +count);

const getLatestRecord = userId => oneOrNone(selectLatestRecordsByUserId(userId));

const prepareAndSaveRecord = userId => {
    const code = cryptoRandomString({
        length: +PHONE_CONFIRMATION_CODE_LENGTH,
        characters: '1234567890',
    });
    const momentCurrentTime = moment();
    const creatingDate = momentCurrentTime.toISOString();
    const expirationDate = momentCurrentTime.add(+PHONE_CONFIRMATION_EXPIRATION_VALUE, PHONE_CONFIRMATION_EXPIRATION_UNIT).toISOString();
    const newRecord = formatRecordToSave(userId, code, creatingDate, expirationDate);
    return addRecord(newRecord);
};

module.exports = {
    addRecord,
    getRecords,
    getRecordsCount,
    getLatestRecord,
    prepareAndSaveRecord,
};
