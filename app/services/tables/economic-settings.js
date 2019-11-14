const { one } = require('db');

// sql-helpers
const {
    updateRecordWithNullCompanyId,
    selectRecordWithNullCompanyId,
} = require('sql-helpers/economic-settings');

const getDefaultRecordStrict = () => one(selectRecordWithNullCompanyId());

const editDefaultRecord = data => one(updateRecordWithNullCompanyId(data));

module.exports = {
    getDefaultRecordStrict,
    editDefaultRecord,
};
