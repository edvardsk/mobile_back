const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const cols = SQL_TABLES.USERS.COLUMNS;

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
    [cols.EMAIL]: user[cols.EMAIL],
    [cols.CREATED_AT]: user[cols.CREATED_AT],
    [cols.FULL_NAME]: user[cols.FULL_NAME],
    [HOMELESS_COLUMNS.ROLE]: user[HOMELESS_COLUMNS.ROLE],
    permissions,
});

const formatPasswordDataToUpdate = data => ({
    [cols.PASSWORD]: data.hash,
    [cols.KEY]: data.key,
});

module.exports = {
    formatUserForSaving,
    formatUserForResponse,
    formatUserWithPermissionsForResponse,
    formatPasswordDataToUpdate,
};
