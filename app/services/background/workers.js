// this file uses only in boss.js file!
const uuid = require('uuid/v4');

// services
const PointsService = require('services/tables/points');
const PointTranslationsService = require('services/tables/point-translations');
const CountriesService = require('services/tables/countries');
const CurrenciesService = require('services/tables/currencies');
const ExchangeRatesService = require('services/tables/exchange-rates');
const ExchangeRatesApiService = require('services/exchange-rates-api');
const GeoService = require('services/google/geo');
const CargosService = require('services/tables/cargos');
const DealsService = require('services/tables/deals');
const DealsStatusesService = require('services/tables/deal-statuses');
const DealsStatusesHistoryService = require('services/tables/deal-statuses-history');
const CarsService = require('services/tables/cars');
const TrailersService = require('services/tables/trailers');
const DriversService = require('services/tables/drivers');
const UsersService = require('services/tables/users');
const TablesService = require('services/tables');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { COUNTRIES_MAP } = require('constants/countries');
const { DEAL_STATUSES_MAP } = require('constants/deal-statuses');

// formatters
const PointTranslationsFormatters = require('formatters/point-translations');
const GeoFormatters = require('formatters/geo');
const GoogleGeoFormatters = require('formatters/google/geo');
const DealStatusesHistoryFormatters = require('formatters/deal-statuses-history');

const colsLanguages = SQL_TABLES.LANGUAGES.COLUMNS;
const colsPoints = SQL_TABLES.POINTS.COLUMNS;
const colsCountries = SQL_TABLES.COUNTRIES.COLUMNS;
const colsCurrencies = SQL_TABLES.CURRENCIES.COLUMNS;
const colsRates = SQL_TABLES.EXCHANGE_RATES.COLUMNS;
const colsDeals = SQL_TABLES.DEALS.COLUMNS;
const colsDrivers = SQL_TABLES.DRIVERS.COLUMNS;
const colsCars = SQL_TABLES.CARS.COLUMNS;
const colsTrailers = SQL_TABLES.TRAILERS.COLUMNS;

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

const autoCancelUnconfirmedDeal = async job => {
    const { dealId } = job.data;

    logger.info(`received ${job.name} ${job.id}`);
    try {
        const dealStatusHistoryId = uuid();
        const [deal, dealStatus] = await Promise.all([
            DealsService.getRecordStrict(dealId),
            DealsStatusesService.getRecordStrict(DEAL_STATUSES_MAP.CANCELLED),
        ]);

        const driverId = deal[colsDeals.DRIVER_ID];
        const carId = deal[colsDeals.CAR_ID];
        const trailerId = deal[colsDeals.TRAILER_ID];

        const [driver, car, trailer] = await Promise.all([
            DriversService.getRecordWithActiveDeals(driverId),
            CarsService.getRecordWithActiveDeals(carId),
            TrailersService.getRecordWithActiveDeals(trailerId),
        ]);

        let transactionsList = [];

        if (driver && driver[colsDrivers.SHADOW] && driver[HOMELESS_COLUMNS.DEALS].length < 2) { // there is at least current deal with CREATED status
            transactionsList.push(
                UsersService.markAsFreezedAsTransaction(driver[colsDrivers.USER_ID])
            );
        }
        if (car && car[colsCars.SHADOW] && car[HOMELESS_COLUMNS.DEALS].length < 2) {
            transactionsList.push(
                CarsService.markAsDeletedAsTransaction(car.id)
            );
        }
        if (trailer && trailer[colsTrailers.SHADOW] && !trailer[HOMELESS_COLUMNS.DEALS].length < 2) {
            transactionsList.push(
                TrailersService.markAsDeletedAsTransaction(trailer.id)
            );
        }

        const statusHistory = DealStatusesHistoryFormatters.formatRecordsToSave(dealStatusHistoryId, dealId, dealStatus.id, null);

        transactionsList = [
            ...transactionsList,
            CargosService.editRecordIncreaseFreeCountAsTransaction(deal[colsDeals.CARGO_ID], 1),
            DealsStatusesHistoryService.addRecordAsTransaction(statusHistory),
        ];

        await TablesService.runTransaction(transactionsList);

        await job.done();
        logger.info(`Job completed id: ${job.id}`);

    } catch (err) {
        logger.error(`Job failed id: ${job.id}`);
        await job.done(err);
        onError(err);
    }
};

const autoSetGoingToUploadDealStatus = async job => {
    const { dealId } = job.data;

    logger.info(`received ${job.name} ${job.id}`);
    try {
        const dealStatusHistoryId = uuid();
        const [deal, dealStatus] = await Promise.all([
            DealsService.getRecordStrict(dealId),
            DealsStatusesService.getRecordStrict(DEAL_STATUSES_MAP.GOING_TO_UPLOADING),
        ]);

        if (deal[HOMELESS_COLUMNS.DEAL_STATUS_NAME] === DEAL_STATUSES_MAP.CONFIRMED) {
            const transactionsList = [];

            const statusHistory = DealStatusesHistoryFormatters.formatRecordsToSave(dealStatusHistoryId, dealId, dealStatus.id, null);

            transactionsList.push(
                DealsStatusesHistoryService.addRecordAsTransaction(statusHistory)
            );

            await TablesService.runTransaction(transactionsList);
        } else {
            logger.info(`Job id: ${job.id} didn't do anything`);
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
    extractExchangeRate,
    autoCancelUnconfirmedDeal,
    autoSetGoingToUploadDealStatus,
};
