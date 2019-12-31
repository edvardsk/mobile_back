// constants
const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.DEAL_STATUSES_HISTORY_CONFIRMATIONS.COLUMNS;

const formatRecordToSave = (dealHistoryId, confirmedByTransporter, confirmedByHolder) => ({
    [cols.DEAL_STATUS_HISTORY_ID]: dealHistoryId,
    [cols.CONFIRMED_BY_TRANSPORTER]: !!confirmedByTransporter,
    [cols.CONFIRMED_BY_HOLDER]: !!confirmedByHolder,
});

const formatRecordToConfirmBySomeRole = (isTransporter) => ({
    [isTransporter ? cols.CONFIRMED_BY_TRANSPORTER : cols.CONFIRMED_BY_HOLDER]: true,
});

module.exports = {
    formatRecordToSave,
    formatRecordToConfirmBySomeRole,
};
