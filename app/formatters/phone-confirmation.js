const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.PHONE_CONFIRMATION_CODES.COLUMNS;

const formatRecordToSave = (userId, code, creatingDate, expirationDate) => ({
    [cols.USER_ID]: userId,
    [cols.CODE]: code,
    [cols.CREATED_AT]: creatingDate,
    [cols.EXPIRED_AT]: expirationDate,
});

module.exports = {
    formatRecordToSave,
};
