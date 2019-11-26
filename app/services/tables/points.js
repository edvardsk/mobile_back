const { one, manyOrNone } = require('db');

// sql-helpers
const {
    insertRecords,
    selectRecordsByPoints,
    selectRecordsByPoint,
    selectRecordById,
    selectRecordsByPointAndLanguageIdWithTranslations,
} = require('sql-helpers/points');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordsAsTransaction = values => [insertRecords(values), OPERATIONS.MANY];

const getRecordsByPoints = points => manyOrNone(selectRecordsByPoints(points));

const getRecordsByPoint = point => one(selectRecordsByPoint(point));

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
