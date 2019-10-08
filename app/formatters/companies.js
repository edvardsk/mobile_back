const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.COMPANIES.COLUMNS;

const formatInitialDataToSave = (body, userId) => ({
    [cols.USER_ID]: userId,
    [cols.NAME]: body[cols.NAME],
});

module.exports = {
    formatInitialDataToSave,
};
