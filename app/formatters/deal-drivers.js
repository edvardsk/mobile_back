const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const cols = SQL_TABLES.DEAL_DRIVERS.COLUMNS;
const colsUsers = SQL_TABLES.USERS.COLUMNS;
const colsDrivers = SQL_TABLES.DRIVERS.COLUMNS;

const formatRecordToSaveFromOriginal = (id, user, driver) => ({
    id,
    [cols.DRIVER_ID]: driver.id,
    [cols.EMAIL]: user[colsUsers.EMAIL],
    [cols.FULL_NAME]: user[colsUsers.FULL_NAME],
    [cols.NUMBER]: user[HOMELESS_COLUMNS.PHONE_NUMBER],
    [cols.PHONE_PREFIX_ID]: user[HOMELESS_COLUMNS.PHONE_PREFIX_ID],
    [cols.DRIVER_LICENCE_REGISTERED_AT]: driver[colsDrivers.DRIVER_LICENCE_REGISTERED_AT].toISOString(),
    [cols.DRIVER_LICENCE_EXPIRED_AT]: driver[colsDrivers.DRIVER_LICENCE_EXPIRED_AT].toISOString(),
    [cols.PASSPORT_NUMBER]: user[colsUsers.PASSPORT_NUMBER],
    [cols.PASSPORT_PERSONAL_ID]: user[colsUsers.PASSPORT_PERSONAL_ID],
    [cols.PASSPORT_ISSUING_AUTHORITY]: user[colsUsers.PASSPORT_ISSUING_AUTHORITY],
    [cols.PASSPORT_CREATED_AT]: user[colsUsers.PASSPORT_CREATED_AT].toISOString(),
    [cols.PASSPORT_EXPIRED_AT]: user[colsUsers.PASSPORT_EXPIRED_AT].toISOString(),

});

module.exports = {
    formatRecordToSaveFromOriginal,
};
