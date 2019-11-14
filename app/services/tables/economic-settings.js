const { one, oneOrNone } = require('db');

// sql-helpers
const {
    insertRecord,
    updateRecordWithNullCompanyId,
    selectRecordWithNullCompanyId,
    selectRecordByCompanyId,
} = require('sql-helpers/economic-settings');

const createRecord = data => one(insertRecord(data));

const getRecordByCompanyId = companyId => oneOrNone(selectRecordByCompanyId(companyId));

const getDefaultRecordStrict = () => one(selectRecordWithNullCompanyId());

const editDefaultRecord = data => one(updateRecordWithNullCompanyId(data));

const checkEconomicSettingsExistsOpposite = async (meta, companyId) => {
    const setting = await getRecordByCompanyId(companyId);
    return !setting;
};

module.exports = {
    createRecord,
    getRecordByCompanyId,
    getDefaultRecordStrict,
    editDefaultRecord,

    checkEconomicSettingsExistsOpposite,
};
