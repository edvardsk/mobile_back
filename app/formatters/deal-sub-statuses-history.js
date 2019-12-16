// constants
const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.DEAL_SUB_STATUSES_HISTORY.COLUMNS;

const formatRecordsToSave = (statusHistoryId, subStatusId, description, initiatorId = null) => ({
    [cols.DEAL_STATUS_HISTORY_ID]: statusHistoryId,
    [cols.DEAL_SUB_STATUS_ID]: subStatusId,
    [cols.DESCRIPTION]: description,
    [cols.INITIATOR_ID]: initiatorId,
});

module.exports = {
    formatRecordsToSave,
};
