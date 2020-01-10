// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const cols = SQL_TABLES.DEAL_PROBLEMS.COLUMNS;

const formatRecordsToSave = (dealStatusHistoryId, comment, initiatorId = null) => ({
    [cols.DEAL_STATUS_HISTORY_ID]: dealStatusHistoryId,
    [cols.DESCRIPTION]: comment,
    [cols.INITIATOR_ID]: initiatorId,
});

const formatRecordsFromPostgresJSON = records => records.map(record => formatRecordFromPostgresJSON(record));

const formatRecordFromPostgresJSON = record => {
    const { f1, f2, f3 } = record;
    return {
        id: f1,
        [HOMELESS_COLUMNS.STATUS]: f2,
        [cols.DESCRIPTION]: f3,
    };
};

module.exports = {
    formatRecordsToSave,
    formatRecordsFromPostgresJSON,
};
