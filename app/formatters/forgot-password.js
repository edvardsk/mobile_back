const moment = require('moment');
const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.FORGOT_PASSWORD.COLUMNS;
const { FORGOT_PASSWORD_EXPIRATION_KEY, FORGOT_PASSWORD_EXPIRATION_VALUE } = process.env;

const formatRecordToSave = (userId, hash) => ({
    [cols.USER_ID]: userId,
    [cols.HASH]: hash,
    [cols.EXPIRED_AT]: moment()
        .add(FORGOT_PASSWORD_EXPIRATION_VALUE, FORGOT_PASSWORD_EXPIRATION_KEY)
        .toISOString(),
});

module.exports = {
    formatRecordToSave,
};
