// this file uses only in boss.js file!

// services
const PointsService = require('services/tables/points');
const PointTranslationsService = require('services/tables/point-translations');
const CountriesService = require('services/tables/countries');
const CurrenciesService = require('services/tables/currencies');
const ExchangeRatesService = require('services/tables/exchange-rates');
const ExchangeRatesApiService = require('services/exchange-rates-api');
const GeoService = require('services/google/geo');
const TablesService = require('services/tables');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { COUNTRIES_MAP } = require('constants/countries');

// formatters
const PointTranslationsFormatters = require('formatters/point-translations');
const GeoFormatters = require('formatters/geo');
const GoogleGeoFormatters = require('formatters/google/geo');

const colsLanguages = SQL_TABLES.LANGUAGES.COLUMNS;
const colsPoints = SQL_TABLES.POINTS.COLUMNS;
const colsCountries = SQL_TABLES.COUNTRIES.COLUMNS;
const colsCurrencies = SQL_TABLES.CURRENCIES.COLUMNS;
const colsRates = SQL_TABLES.EXCHANGE_RATES.COLUMNS;

const MAP_COUNTRIES_AND_SERVICES = {
    [COUNTRIES_MAP.BELARUS]: ExchangeRatesApiService.extractBelarusRates,
    [COUNTRIES_MAP.RUSSIA]: ExchangeRatesApiService.extractRussiaRates,
    [COUNTRIES_MAP.UKRAINE]: ExchangeRatesApiService.extractUkraineRates,
};

const translateCoordinates = async job => {
    logger.info(`received ${job.name} ${job.id}`);
    try {
        const { pointId, language } = job.data;

        const point = await PointsService.getRecordStrict(pointId);
        const { longitude, latitude } = GeoFormatters.formatGeoPointToObject(point[colsPoints.COORDINATES]);
        const languageToCode = language[colsLanguages.CODE];

        const place = await GeoService.getPlaceByCoordinates(latitude, longitude, languageToCode);
        const cityName = GoogleGeoFormatters.formatCityName(place);

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
}

;const extractExchangeRate = async job => {
    const { countryId, extractingDate } = job.data;

    logger.info(`received ${job.name} ${job.id} | country id: ${countryId}`);
    try {
        const country = await CountriesService.getCountryStrict(countryId);
        const countryName = country[colsCountries.NAME];

        const currenciesFromDb = await CurrenciesService.getCurrencies();
        const currenciesMap = new Map(currenciesFromDb.map(currency => [currency[colsCurrencies.CODE], currency]));

        const downloadedCurrencies = await MAP_COUNTRIES_AND_SERVICES[countryName](currenciesMap, extractingDate);

        const exchangeRatesArray = downloadedCurrencies.map(currency => ({
            [colsRates.COUNTRY_ID]: countryId,
            [colsRates.CURRENCY_ID]: currenciesMap.get(currency[HOMELESS_COLUMNS.CURRENCY_CODE]).id,
            [colsRates.VALUE]: currency[HOMELESS_COLUMNS.CURRENCY_RATE],
            [colsRates.NOMINAL]: currency[HOMELESS_COLUMNS.CURRENCY_SCALE],
            [colsRates.ACTUAL_DATE]: extractingDate,
        }));

        const transactionsList = [
            ExchangeRatesService.removeRecordsByCountryIdAsTransaction(countryId),
            ExchangeRatesService.addRecordsAsTransaction(exchangeRatesArray),
        ];

        await TablesService.runTransaction(transactionsList);

        await job.done();
        logger.info(`Job completed id: ${job.id}`);

    } catch (err) {
        // todo: notify admin
        logger.error(`Job failed id: ${job.id}`);
        await job.done(err);
        onError(err);
    }
};

const cancelUnconfirmedDeal = async job => {
    // const { dealId } = job.data;

    logger.info(`received ${job.name} ${job.id}`);
    try {
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
    extractExchangeRate,
    cancelUnconfirmedDeal,
};
