// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { SqlString } = require('constants/instances');

const cols = SQL_TABLES.POINT_TRANSLATIONS.COLUMNS;

const formatTranslationsToSave = (pointsIds, records, languageId) => records.map((record, i) => formatTranslationToSave(pointsIds[i], record[HOMELESS_COLUMNS.NAME_EN], languageId));

const formatTranslationToSave = (pointId, value, languageId) => ({
    [cols.POINT_ID]: pointId,
    [cols.LANGUAGE_ID]: languageId,
    [cols.VALUE]: new SqlString(value),
});

module.exports = {
    formatTranslationsToSave,
    formatTranslationToSave,
};
