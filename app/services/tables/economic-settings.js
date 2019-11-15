const { one, oneOrNone } = require('db');

// sql-helpers
const {
    insertRecord,
    updateRecordByCompanyId,
    deleteRecordByCompanyId,
    updateRecordWithNullCompanyId,
    selectRecordWithNullCompanyId,
    selectRecordByCompanyId,
} = require('sql-helpers/economic-settings');

const createRecord = data => one(insertRecord(data));

const editRecordByCompanyId = (companyId, data) => one(updateRecordByCompanyId(companyId, data));

const removeRecordByCompanyId = companyId => one(deleteRecordByCompanyId(companyId));

const getRecordByCompanyId = companyId => oneOrNone(selectRecordByCompanyId(companyId));

const getDefaultRecordStrict = () => one(selectRecordWithNullCompanyId());

const editDefaultRecord = data => one(updateRecordWithNullCompanyId(data));

const checkEconomicSettingsExistsOpposite = async (meta, companyId) => {
    const setting = await getRecordByCompanyId(companyId);
    return !setting;
};

const checkEconomicSettingsExists = async (meta, companyId) => {
    const setting = await getRecordByCompanyId(companyId);
    return !!setting;
};

module.exports = {
    createRecord,
    editRecordByCompanyId,
    removeRecordByCompanyId,
    getRecordByCompanyId,
    getDefaultRecordStrict,
    editDefaultRecord,

    checkEconomicSettingsExistsOpposite,
    checkEconomicSettingsExists,
};
