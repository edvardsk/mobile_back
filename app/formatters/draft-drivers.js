const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const cols = SQL_TABLES.DRAFT_DRIVERS.COLUMNS;
const colsUsers = SQL_TABLES.USERS.COLUMNS;
const colsDrivers = SQL_TABLES.DRIVERS.COLUMNS;

const formatRecordToSave = (id, driverId, body) => ({
    id,
    [cols.DRIVER_ID]: driverId,
    [cols.EMAIL]: body[colsUsers.EMAIL],
    [cols.FULL_NAME]: colsUsers[cols.FULL_NAME],
    [cols.NUMBER]: body[HOMELESS_COLUMNS.PHONE_NUMBER],
    [cols.PHONE_PREFIX_ID]: body[HOMELESS_COLUMNS.PHONE_PREFIX_ID],
    [cols.DRIVER_LICENCE_REGISTERED_AT]: body[colsDrivers.DRIVER_LICENCE_REGISTERED_AT],
    [cols.DRIVER_LICENCE_EXPIRED_AT]: body[colsDrivers.DRIVER_LICENCE_EXPIRED_AT],
});

const formatRecordToEdit = (body) => ({
    [cols.EMAIL]: body[colsUsers.EMAIL],
    [cols.FULL_NAME]: body[colsUsers.FULL_NAME],
    [cols.NUMBER]: body[HOMELESS_COLUMNS.PHONE_NUMBER],
    [cols.PHONE_PREFIX_ID]: body[HOMELESS_COLUMNS.PHONE_PREFIX_ID],
    [cols.DRIVER_LICENCE_REGISTERED_AT]: body[colsDrivers.DRIVER_LICENCE_REGISTERED_AT],
    [cols.DRIVER_LICENCE_EXPIRED_AT]: body[colsDrivers.DRIVER_LICENCE_EXPIRED_AT],
});

module.exports = {
    formatRecordToSave,
    formatRecordToEdit,
};
