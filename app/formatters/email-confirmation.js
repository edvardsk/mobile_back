const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.EMAIL_CONFIRMATION_HASHES.COLUMNS;

const formatRecordToSave = (userId, hash) => ({
    [cols.USER_ID]: userId,
    [cols.HASH]: hash,
});

module.exports = {
    formatRecordToSave,
};
