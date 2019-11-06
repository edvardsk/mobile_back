const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const cols = SQL_TABLES.USERS.COLUMNS;
const colsFreezingHistory = SQL_TABLES.FREEZING_HISTORY.COLUMNS;

const formatUserForSaving = (id, user, password, key) => ({
    id,
    [cols.EMAIL]: user[cols.EMAIL],
    [cols.PASSWORD]: password,
    [cols.KEY]: key,
    [cols.FULL_NAME]: user[cols.FULL_NAME],
});

const formatUserForResponse = user => ({
    [cols.EMAIL]: user[cols.EMAIL],
    [cols.CREATED_AT]: user[cols.CREATED_AT],
    [cols.FULL_NAME]: user[cols.FULL_NAME],
    [HOMELESS_COLUMNS.ROLE]: user[HOMELESS_COLUMNS.ROLE],
});

const formatUserWithPermissionsForResponse = (user, permissions) => ({
    id: user.id,
    [cols.EMAIL]: user[cols.EMAIL],
    [cols.CREATED_AT]: user[cols.CREATED_AT],
    [cols.FULL_NAME]: user[cols.FULL_NAME],
    [HOMELESS_COLUMNS.ROLE]: user[HOMELESS_COLUMNS.ROLE],
    permissions: Array.from(permissions),
});

const formatPasswordDataToUpdate = data => ({
    [cols.PASSWORD]: data.hash,
    [cols.KEY]: data.key,
});

const formatUserWithPhoneAndRole = data => ({
    id: data.id,
    [cols.EMAIL]: data[cols.EMAIL],
    [cols.FULL_NAME]: data[cols.FULL_NAME],
    [HOMELESS_COLUMNS.ROLE]: data[HOMELESS_COLUMNS.ROLE],
    [HOMELESS_COLUMNS.FULL_PHONE_NUMBER]: data[HOMELESS_COLUMNS.FULL_PHONE_NUMBER],
    [colsFreezingHistory.FREEZED]: !!data[colsFreezingHistory.FREEZED],
});

module.exports = {
    formatUserForSaving,
    formatUserForResponse,
    formatUserWithPermissionsForResponse,
    formatPasswordDataToUpdate,
    formatUserWithPhoneAndRole,
};
