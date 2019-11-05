const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const cols = SQL_TABLES.DRIVERS.COLUMNS;
const colsUsers = SQL_TABLES.USERS.COLUMNS;

const formatRecordToSave = (userId, body) => ({
    [cols.USER_ID]: userId,
    [cols.DRIVER_LICENCE_REGISTERED_AT]: body[cols.DRIVER_LICENCE_REGISTERED_AT],
    [cols.DRIVER_LICENCE_EXPIRED_AT]: body[cols.DRIVER_LICENCE_EXPIRED_AT],
});

const formatDriversWithPhoneAndRole = data => ({
    id: data.id,
    [colsUsers.FULL_NAME]: data[colsUsers.FULL_NAME],
    [HOMELESS_COLUMNS.ROLE]: data[HOMELESS_COLUMNS.ROLE],
    [HOMELESS_COLUMNS.FULL_PHONE_NUMBER]: data[HOMELESS_COLUMNS.FULL_PHONE_NUMBER],
    [cols.DRIVER_LICENCE_REGISTERED_AT]: data[cols.DRIVER_LICENCE_REGISTERED_AT],
    [cols.DRIVER_LICENCE_EXPIRED_AT]: data[cols.DRIVER_LICENCE_EXPIRED_AT],
});

module.exports = {
    formatRecordToSave,
    formatDriversWithPhoneAndRole,
};
