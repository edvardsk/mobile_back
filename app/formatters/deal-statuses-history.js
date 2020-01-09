// constants
const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.DEAL_HISTORY_STATUSES.COLUMNS;

const formatRecordsToSave = (id, dealId, dealStatusId, initiatorId = null, comment = null) => ({
    id,
    [cols.DEAL_ID]: dealId,
    [cols.DEAL_STATUS_ID]: dealStatusId,
    [cols.INITIATOR_ID]: initiatorId,
    [cols.COMMENT]: comment,
});

module.exports = {
    formatRecordsToSave,
};
