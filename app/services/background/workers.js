// this file uses only in boss.js file!

// services
const PointTranslationsService = require('services/tables/point-translations');
const TranslatorService = require('services/google/translator');

// constants
const { SQL_TABLES } = require('constants/tables');
const { LANGUAGE_CODES_MAP } = require('constants/languages');

// formatters
const PointTranslationsFormatters = require('formatters/point-translations');

const colsLanguages = SQL_TABLES.LANGUAGES.COLUMNS;

const translateCoordinates = async job => {
    logger.info(`received ${job.name} ${job.id}`);
    try {
        const { pointId, language, originalValue } = job.data;

        const languageToCode = language[colsLanguages.CODE];

        const translation = await TranslatorService.translateText(LANGUAGE_CODES_MAP.EN, languageToCode, originalValue);

        const translationData = PointTranslationsFormatters.formatTranslationToSave(pointId, translation, language.id);
        await PointTranslationsService.addRecord(translationData);

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
