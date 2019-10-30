const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.FREEZING_HISTORY.COLUMNS;

const formatRecordToSave = (initiatorId, targerId, isFreezed) => ({
    [cols.INITIATOR_ID]: initiatorId,
    [cols.TARGET_ID]: targerId,
    [cols.FREEZED]: isFreezed,
});

module.exports = {
    formatRecordToSave,
};
