const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.FREEZING_HISTORY.COLUMNS;

const formatRecordToSave = (initiatorId, targetId, isFreezed) => ({
    [cols.INITIATOR_ID]: initiatorId,
    [cols.TARGET_ID]: targetId,
    [cols.FREEZED]: isFreezed,
});

module.exports = {
    formatRecordToSave,
};
