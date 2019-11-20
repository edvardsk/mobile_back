const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const cols = SQL_TABLES.USERS.COLUMNS;

const formatUserForSaving = (id, body, password, key) => ({
    id,
    [cols.EMAIL]: body[cols.EMAIL],
    [cols.PASSWORD]: password,
    [cols.KEY]: key,
    [cols.FULL_NAME]: body[cols.FULL_NAME],
    [cols.LANGUAGE_ID]: body[cols.LANGUAGE_ID],
});

const formatUserForResponse = user => ({
    id: user.id,
    [cols.EMAIL]: user[cols.EMAIL],
    [cols.CREATED_AT]: user[cols.CREATED_AT],
    [cols.FULL_NAME]: user[cols.FULL_NAME],
    [HOMELESS_COLUMNS.ROLE]: user[HOMELESS_COLUMNS.ROLE],
    [HOMELESS_COLUMNS.FULL_PHONE_NUMBER]: user[HOMELESS_COLUMNS.FULL_PHONE_NUMBER],
    [cols.FREEZED]: user[cols.FREEZED],
});

const formatUserWithPermissionsForResponse = (user, permissions) => ({
    id: user.id,
    [cols.EMAIL]: user[cols.EMAIL],
    [cols.CREATED_AT]: user[cols.CREATED_AT],
    [cols.FULL_NAME]: user[cols.FULL_NAME],
    [HOMELESS_COLUMNS.LANGUAGE_CODE]: user[HOMELESS_COLUMNS.LANGUAGE_CODE],
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
    [cols.FREEZED]: data[cols.FREEZED],
});

const formatUserWithPhoneNumberAndRole = data => ({
    id: data.id,
    [cols.EMAIL]: data[cols.EMAIL],
    [cols.FULL_NAME]: data[cols.FULL_NAME],
    [HOMELESS_COLUMNS.ROLE]: data[HOMELESS_COLUMNS.ROLE],
    [HOMELESS_COLUMNS.PHONE_NUMBER]: data[HOMELESS_COLUMNS.PHONE_NUMBER],
    [HOMELESS_COLUMNS.PHONE_PREFIX_ID]: data[HOMELESS_COLUMNS.PHONE_PREFIX_ID],
    [cols.FREEZED]: data[cols.FREEZED],
});

const formatFreezingFieldToEdit = value => ({
    [cols.FREEZED]: value,
});

const formatUserToUpdate = data => ({
    [cols.EMAIL]: data[cols.EMAIL],
    [cols.FULL_NAME]: data[cols.FULL_NAME],
});

module.exports = {
    formatUserForSaving,
    formatUserForResponse,
    formatUserWithPermissionsForResponse,
    formatPasswordDataToUpdate,
    formatUserWithPhoneAndRole,
    formatUserWithPhoneNumberAndRole,
    formatFreezingFieldToEdit,
    formatUserToUpdate,
};
