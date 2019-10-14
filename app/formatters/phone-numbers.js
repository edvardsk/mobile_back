const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.PHONE_NUMBERS.COLUMNS;

const formatPhoneNumberToSave = (userId, prefixId, number) => ({
    [cols.NUMBER]: number,
    [cols.USER_ID]: userId,
    [cols.PHONE_PREFIX_ID]: prefixId,
});

module.exports = {
    formatPhoneNumberToSave,
};
