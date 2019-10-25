const moment = require('moment');
const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.EMAIL_CONFIRMATION_HASHES.COLUMNS;

const formatRecordToSave = (userId, hash, expirationDate = null) => ({
    [cols.USER_ID]: userId,
    [cols.HASH]: hash,
    [cols.EXPIRED_AT]: expirationDate,
});

const formatUsedRecordToUpdate = () => ({
    [cols.USED]: true,
});

const formatExpiredRecordToUpdate = () => ({
    [cols.EXPIRED_AT]: moment().toISOString(),
});

module.exports = {
    formatRecordToSave,
    formatUsedRecordToUpdate,
    formatExpiredRecordToUpdate,
};
