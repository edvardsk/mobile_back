const uuid = require('uuid/v4');

// constants
const { SQL_TABLES } = require('constants/tables');

// formatters
const { formatTranslationsToSave } = require('./point-translations');

const cols = SQL_TABLES.POINTS.COLUMNS;
const colsCargoPoints = SQL_TABLES.CARGO_POINTS.COLUMNS;

const formatPointsAndTranslationsToSave = (records, languageId) => {
    const pointsIds = records.map(() => uuid());
    const points = formatPointsToStore(pointsIds, records);
    const translations = formatTranslationsToSave(pointsIds, records, languageId);
    return [points, translations];
};

const formatPointsToStore = (ids, records) => records.map((record, i) => formatPointToStore(ids[i], record));

const formatPointToStore = (id, record) => ({
    id,
    [cols.COORDINATES]: record[colsCargoPoints.COORDINATES],
});

module.exports = {
    formatPointsAndTranslationsToSave,
};
