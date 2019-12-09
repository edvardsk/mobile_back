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
    [colsUsers.EMAIL]: data[colsUsers.EMAIL],
    [HOMELESS_COLUMNS.ROLE]: data[HOMELESS_COLUMNS.ROLE],
    [HOMELESS_COLUMNS.FULL_PHONE_NUMBER]: data[HOMELESS_COLUMNS.FULL_PHONE_NUMBER],
    [cols.DRIVER_LICENCE_REGISTERED_AT]: data[cols.DRIVER_LICENCE_REGISTERED_AT],
    [cols.DRIVER_LICENCE_EXPIRED_AT]: data[cols.DRIVER_LICENCE_EXPIRED_AT],
    [colsUsers.FREEZED]: data[colsUsers.FREEZED],
});

const formatRecordForList = data => ({
    [HOMELESS_COLUMNS.USER_ID]: data.id,
    [HOMELESS_COLUMNS.DRIVER_ID]: data[HOMELESS_COLUMNS.DRIVER_ID],
    [HOMELESS_COLUMNS.FULL_PHONE_NUMBER]: data[HOMELESS_COLUMNS.FULL_PHONE_NUMBER],
    [colsUsers.EMAIL]: data[colsUsers.EMAIL],
    [colsUsers.FULL_NAME]: data[colsUsers.FULL_NAME],
});

const formatRecordForAvailableList = data => ({
    [HOMELESS_COLUMNS.USER_ID]: data.id,
    [HOMELESS_COLUMNS.DRIVER_ID]: data[HOMELESS_COLUMNS.DRIVER_ID],
    [HOMELESS_COLUMNS.FULL_PHONE_NUMBER]: data[HOMELESS_COLUMNS.FULL_PHONE_NUMBER],
    [HOMELESS_COLUMNS.PHONE_NUMBER]: data[HOMELESS_COLUMNS.PHONE_NUMBER],
    [HOMELESS_COLUMNS.PHONE_PREFIX_ID]: data[HOMELESS_COLUMNS.PHONE_PREFIX_ID],
    [colsUsers.EMAIL]: data[colsUsers.EMAIL],
    [colsUsers.FULL_NAME]: data[colsUsers.FULL_NAME],
});

module.exports = {
    formatRecordToSave,
    formatDriversWithPhoneAndRole,
    formatRecordForList,
    formatRecordForAvailableList,
};
