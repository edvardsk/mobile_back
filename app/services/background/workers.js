// this file uses only in boss.js file!

// services
const PointsService = require('services/tables/points');
const PointTranslationsService = require('services/tables/point-translations');
const GeoService = require('services/google/geo');

// constants
const { SQL_TABLES } = require('constants/tables');

// formatters
const PointTranslationsFormatters = require('formatters/point-translations');
const GeoFormatters = require('formatters/geo');

const colsLanguages = SQL_TABLES.LANGUAGES.COLUMNS;
const colsPoints = SQL_TABLES.POINTS.COLUMNS;

const translateCoordinates = async job => {
    logger.info(`received ${job.name} ${job.id}`);
    try {
        const { pointId, language } = job.data;

        const point = await PointsService.getRecordStrict(pointId);
        const { longitude, latitude } = GeoFormatters.formatGeoPointToObject(point[colsPoints.COORDINATES]);
        const languageToCode = language[colsLanguages.CODE];

        const cityName = await GeoService.getCityByCoordinates(latitude, longitude, languageToCode);

        if (cityName) {
            const translationData = PointTranslationsFormatters.formatTranslationToSave(pointId, cityName, language.id);
            await PointTranslationsService.addRecord(translationData);
        } else {
            logger.error(`did not translated job-id: ${job.id}, point-id: ${pointId}, language-id: ${language.id}`);
        }

        await job.done();
        logger.info(`Job completed id: ${job.id}`);

    } catch (err) {
        logger.error(`Job failed id: ${job.id}`);
        await job.done(err);
        onError(err);
    }
};

const onError = error => {
    logger.error(error);
};

module.exports = {
    translateCoordinates,
};
