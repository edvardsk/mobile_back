const uuid = require('uuid/v4');
const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.TRACKING_SOCKET_HASHES.COLUMNS;

const formatRecordToSave = (userId, dealId, hash, expirationDate = null) => ({
    [cols.USER_ID]: userId,
    [cols.DEAL_ID]: dealId,
    [cols.HASH]: hash || uuid(),
    [cols.EXPIRED_AT]: expirationDate,
});

module.exports = {
    formatRecordToSave,
};
