const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.USERS_TO_COMPANIES.COLUMNS;

const formatRecordToSave = (userId, companyId) => ({
    [cols.USER_ID]: userId,
    [cols.COMPANY_ID]: companyId,
});

module.exports = {
    formatRecordToSave,
};
