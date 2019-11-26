const { one, oneOrNone, manyOrNone } = require('db');

// sql-helpers
const {
    insertRecords,
    selectRecordsByPoints,
    selectRecordByPoint,
    selectRecordById,
    selectRecordsByPointAndLanguageIdWithTranslations,
} = require('sql-helpers/points');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = values => [insertRecords(values), OPERATIONS.MANY];

const getRecordsByPoints = points => manyOrNone(selectRecordsByPoints(points));

const getRecordsByPoint = point => oneOrNone(selectRecordByPoint(point));

const getRecordStrict = id => one(selectRecordById(id));

const getRecordsByPointAndLanguageIdWithTranslationsStrict = (point, languageId) => one(
    selectRecordsByPointAndLanguageIdWithTranslations(point, languageId)
);

module.exports = {
    addRecordsAsTransaction,
    getRecordsByPoints,
    getRecordsByPoint,
    getRecordStrict,
    getRecordsByPointAndLanguageIdWithTranslationsStrict,
};
