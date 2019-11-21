const uuid = require('uuid/v4');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const cols = SQL_TABLES.POINTS.COLUMNS;
const colsCargoPoints = SQL_TABLES.CARGO_POINTS.COLUMNS;
const colsTranslations = SQL_TABLES.POINT_TRANSLATIONS.COLUMNS;

const formatPointsAndTranslationsToSave = (records, languageId) => {
    const pointsIds = records.map(() => uuid());
    const points = formatPointsToStore(pointsIds, records);
    const translations = formatTranslationsToSave(pointsIds, records, languageId);
    return [points, translations];
};

const formatPointsToStore = (ids, records) => records.map((record, i) => formatPointToStore(ids[i], record));

const formatPointToStore = (id, record) => ({
    id,
    [cols.POINT]: record[colsCargoPoints.COORDINATES],
});

const formatTranslationsToSave = (pointsIds, records, languageId) => records.map((record, i) => formatTranslationToSave(pointsIds[i], record[HOMELESS_COLUMNS.NAME_EN], languageId));

const formatTranslationToSave = (pointId, value, languageId) => ({
    [colsTranslations.POINT_ID]: pointId,
    [colsTranslations.LANGUAGE_ID]: languageId,
    [colsTranslations.VALUE]: value,
});

module.exports = {
    formatPointsAndTranslationsToSave,
};
