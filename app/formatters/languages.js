// constants
const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.LANGUAGES.COLUMNS;

const formatLanguagesForResponse = list => list.map(item => formatLanguageForResponse(item));

const formatLanguageForResponse = data => ({
    id: data.id,
    [cols.CODE]: data[cols.CODE],
    [cols.NAME]: data[cols.NAME],
});

module.exports = {
    formatLanguagesForResponse,
};
