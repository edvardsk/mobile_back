// constants
const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.TNVED_CODES_KEYWORDS.COLUMNS;

const formatTNVEDKeywordToSave = ({ tnved_code_id, value, language_id }) => ({
    [cols.TNVED_CODE_ID]: tnved_code_id,
    [cols.VALUE]: value,
    [cols.LANGUAGE_ID]: language_id,
});

module.exports = {
    formatTNVEDKeywordToSave,
};
