const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const cols = SQL_TABLES.PHONE_NUMBERS.COLUMNS;
const colsDraftDrivers = SQL_TABLES.DRAFT_DRIVERS.COLUMNS;

const formatPhoneNumberToSave = (userId, prefixId, number) => ({
    [cols.NUMBER]: number,
    [cols.USER_ID]: userId,
    [cols.PHONE_PREFIX_ID]: prefixId,
});

const formatPhoneNumberToUpdate = data => ({
    [cols.NUMBER]: data[HOMELESS_COLUMNS.PHONE_NUMBER],
    [cols.PHONE_PREFIX_ID]: data[HOMELESS_COLUMNS.PHONE_PREFIX_ID],
});

const formatPhoneNumberToUpdateFromDraft = draftDriver => ({
    [cols.PHONE_PREFIX_ID]: draftDriver[colsDraftDrivers.PHONE_PREFIX_ID],
    [cols.NUMBER]: draftDriver[colsDraftDrivers.NUMBER],
});

module.exports = {
    formatPhoneNumberToSave,
    formatPhoneNumberToUpdate,
    formatPhoneNumberToUpdateFromDraft,
};
