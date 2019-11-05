const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.DRIVERS.COLUMNS;

const formatRecordToSave = (userId, body) => ({
    [cols.USER_ID]: userId,
    [cols.DRIVER_LICENCE_REGISTERED_AT]: body[cols.DRIVER_LICENCE_REGISTERED_AT],
    [cols.DRIVER_LICENCE_EXPIRED_AT]: body[cols.DRIVER_LICENCE_EXPIRED_AT],
});

module.exports = {
    formatRecordToSave,
};
