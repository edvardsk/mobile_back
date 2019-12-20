const moment = require('moment');

const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const cols = SQL_TABLES.USERS.COLUMNS;
const colsDraftDrivers = SQL_TABLES.DRAFT_DRIVERS.COLUMNS;

const DATE_FORMAT = 'YYYY-MM-DD';

const formatUserForSaving = (id, body, password, key) => ({
    id,
    [cols.EMAIL]: body[cols.EMAIL],
    [cols.PASSWORD]: password,
    [cols.KEY]: key,
    [cols.FULL_NAME]: body[cols.FULL_NAME],
    [cols.LANGUAGE_ID]: body[cols.LANGUAGE_ID],
    [cols.PASSPORT_NUMBER]: body[cols.PASSPORT_NUMBER] || null,
    [cols.PASSPORT_PERSONAL_ID]: body[cols.PASSPORT_PERSONAL_ID] || null,
    [cols.PASSPORT_ISSUING_AUTHORITY]: body[cols.PASSPORT_ISSUING_AUTHORITY] || null,
    [cols.PASSPORT_CREATED_AT]: body[cols.PASSPORT_CREATED_AT] || null,
    [cols.PASSPORT_EXPIRED_AT]: body[cols.PASSPORT_EXPIRED_AT] || null,
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
    [HOMELESS_COLUMNS.CURRENCY_ID]: user[HOMELESS_COLUMNS.CURRENCY_ID],
    [HOMELESS_COLUMNS.CURRENCY_CODE]: user[HOMELESS_COLUMNS.CURRENCY_CODE],
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
    [cols.PASSPORT_NUMBER]: data[cols.PASSPORT_NUMBER] || null,
    [cols.PASSPORT_PERSONAL_ID]: data[cols.PASSPORT_PERSONAL_ID] || null,
    [cols.PASSPORT_ISSUING_AUTHORITY]: data[cols.PASSPORT_ISSUING_AUTHORITY] || null,
    [cols.PASSPORT_CREATED_AT]: data[cols.PASSPORT_CREATED_AT] || null,
    [cols.PASSPORT_EXPIRED_AT]: data[cols.PASSPORT_EXPIRED_AT] || null,
});

const formatUserFromDraftDriver = draftDriver => ({
    [cols.EMAIL]: draftDriver[colsDraftDrivers.EMAIL],
    [cols.FULL_NAME]: draftDriver[colsDraftDrivers.FULL_NAME],
    [HOMELESS_COLUMNS.PHONE_NUMBER]: draftDriver[colsDraftDrivers.NUMBER],
    [HOMELESS_COLUMNS.PHONE_PREFIX_ID]: draftDriver[colsDraftDrivers.PHONE_PREFIX_ID],
    [cols.PASSPORT_NUMBER]: draftDriver[colsDraftDrivers.PASSPORT_NUMBER],
    [cols.PASSPORT_PERSONAL_ID]: draftDriver[colsDraftDrivers.PASSPORT_PERSONAL_ID],
    [cols.PASSPORT_ISSUING_AUTHORITY]: draftDriver[colsDraftDrivers.PASSPORT_ISSUING_AUTHORITY],
    [cols.PASSPORT_CREATED_AT]: draftDriver[colsDraftDrivers.PASSPORT_CREATED_AT],
    [cols.PASSPORT_EXPIRED_AT]: draftDriver[colsDraftDrivers.PASSPORT_EXPIRED_AT],
});

const formatFreezingFieldToEdit = value => ({
    [cols.FREEZED]: value,
});

const formatUserToUpdate = data => ({
    [cols.EMAIL]: data[cols.EMAIL],
    [cols.FULL_NAME]: data[cols.FULL_NAME],
    [cols.PASSPORT_NUMBER]: data[cols.PASSPORT_NUMBER] || null,
    [cols.PASSPORT_PERSONAL_ID]: data[cols.PASSPORT_PERSONAL_ID] || null,
    [cols.PASSPORT_ISSUING_AUTHORITY]: data[cols.PASSPORT_ISSUING_AUTHORITY] || null,
    [cols.PASSPORT_CREATED_AT]: data[cols.PASSPORT_CREATED_AT] || null,
    [cols.PASSPORT_EXPIRED_AT]: data[cols.PASSPORT_EXPIRED_AT] || null,
});

const formatUserToUpdateFromDraft = draftDriver => ({
    [cols.EMAIL]: draftDriver[colsDraftDrivers.EMAIL],
    [cols.FULL_NAME]: draftDriver[colsDraftDrivers.FULL_NAME],
    [cols.PASSPORT_NUMBER]: draftDriver[colsDraftDrivers.PASSPORT_NUMBER],
    [cols.PASSPORT_PERSONAL_ID]: draftDriver[colsDraftDrivers.PASSPORT_PERSONAL_ID],
    [cols.PASSPORT_ISSUING_AUTHORITY]: draftDriver[colsDraftDrivers.PASSPORT_ISSUING_AUTHORITY],
    [cols.PASSPORT_CREATED_AT]: moment(draftDriver[colsDraftDrivers.PASSPORT_CREATED_AT]).format(DATE_FORMAT),
    [cols.PASSPORT_EXPIRED_AT]: moment(draftDriver[colsDraftDrivers.PASSPORT_EXPIRED_AT]).format(DATE_FORMAT),
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
    formatUserToUpdateFromDraft,
    formatUserFromDraftDriver,
};
