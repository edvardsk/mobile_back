// constants
const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.DEAL_PROBLEMS.COLUMNS;

const formatRecordsToSave = (dealStatusHistoryId, comment, initiatorId = null) => ({
    [cols.DEAL_STATUS_HISTORY_ID]: dealStatusHistoryId,
    [cols.DESCRIPTION]: comment,
    [cols.INITIATOR_ID]: initiatorId,
});

module.exports = {
    formatRecordsToSave,
};
