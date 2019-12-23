const { success } = require('api/response');

// services
const CargosServices = require('services/tables/cargos');
const CarsServices = require('services/tables/cars');
const LanguagesServices = require('services/tables/languages');
const EconomicSettingsServices = require('services/tables/economic-settings');
const CurrencyPrioritiesServices = require('services/tables/currency-priorities');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { LANGUAGE_CODES_MAP } = require('constants/languages');
const { Geo, GeoLine } = require('constants/instances');
const { SEARCH_ITEMS_TYPES } = require('constants/search');

// formatters
const {
    formatRecordForSearchResponse: formatCargosForSearchResponse,
    formatRecordForSearchAllResponse: formatCargosForSearchAllResponse,
} = require('formatters/cargos');
const {
    formatRecordForSearchResponse: formatCarsForSearchResponse,
    formatRecordForSearchAllResponse: formatCarsForSearchAllResponse,
} = require('formatters/cars');

const { formatQueueByPriority } = require('formatters/index');

// helpers
const { clusterizeItems } = require('helpers/cluster');

const colsCurrencyPriorities = SQL_TABLES.CURRENCY_PRIORITIES.COLUMNS;


function mapCargoForClustering(cargo) {
    return {
        coords: [
            cargo['uploading_points'][0][HOMELESS_COLUMNS.LONGITUDE],
            cargo['uploading_points'][0][HOMELESS_COLUMNS.LATITUDE]
        ],
        id: cargo.id,
    };
}

// TODO:
function mapCarForClustering(car) {
    return {
        coords: [
            27.56667 + Math.random(), //lng
            53.9 + Math.random() // lat
        ],
        id: car.id,
    };
}


const search = async (req, res, next) => {
    try {
        const { user, companyId } = res.locals;
        const { query } = req;
        const language = query[HOMELESS_COLUMNS.LANGUAGE_CODE];
        const itemsType = query[HOMELESS_COLUMNS.SEARCH_ITEMS];
        let languageCode = LANGUAGE_CODES_MAP.EN;
        if (user) {
            languageCode = user[HOMELESS_COLUMNS.LANGUAGE_CODE];
        } else if (language) {
            languageCode = language.slice(0, 2).toLowerCase();
        }
        const [userLanguage, defaultLanguage, defaultEconomicSettings, currencyPriorities] = await Promise.all([
            LanguagesServices.getLanguageByCode(languageCode),
            LanguagesServices.getLanguageByCodeStrict(LANGUAGE_CODES_MAP.EN),
            EconomicSettingsServices.getDefaultRecordStrict(),
            CurrencyPrioritiesServices.getRecords(),
        ]);
        const formattedCurrencyPriorities = formatQueueByPriority(
            currencyPriorities,
            colsCurrencyPriorities.CURRENCY_ID,
            colsCurrencyPriorities.NEXT_CURRENCY_ID
        );

        const searchLanguageId = (userLanguage && userLanguage.id) || defaultLanguage.id;
        const uploadingPoint = query[HOMELESS_COLUMNS.UPLOADING_POINT];
        const downloadingPoint = query[HOMELESS_COLUMNS.DOWNLOADING_POINT];
        const searchRadius = query[HOMELESS_COLUMNS.SEARCH_RADIUS];

        const upGeo = new Geo(uploadingPoint[HOMELESS_COLUMNS.LONGITUDE], uploadingPoint[HOMELESS_COLUMNS.LATITUDE]);

        let downGeo = null;
        let geoLine = null;
        if (downloadingPoint) {
            downGeo = new Geo(downloadingPoint[HOMELESS_COLUMNS.LONGITUDE], downloadingPoint[HOMELESS_COLUMNS.LATITUDE]);

            geoLine = new GeoLine(
                uploadingPoint[HOMELESS_COLUMNS.LONGITUDE],
                uploadingPoint[HOMELESS_COLUMNS.LATITUDE],
                downloadingPoint[HOMELESS_COLUMNS.LONGITUDE],
                downloadingPoint[HOMELESS_COLUMNS.LATITUDE]
            );
        }

        const coordinates = {
            upGeo,
            downGeo,
            geoLine,
        };

        const dates = {
            uploadingDate: query[HOMELESS_COLUMNS.UPLOADING_DATE],
            downloadingDate: query[HOMELESS_COLUMNS.DOWNLOADING_DATE],
        };

        const showCargos = itemsType === SEARCH_ITEMS_TYPES.CARGOS;
        const showCars = itemsType === SEARCH_ITEMS_TYPES.CARS;
        const result = {};

        if (companyId) {
            const [cargos, cars] = await Promise.all([
                CargosServices.getRecordsForSearch(coordinates, dates, searchRadius, searchLanguageId, companyId, showCargos, query),
                CarsServices.getRecordsForSearch(companyId, showCars, query)
            ]);
            const formattedCargos = formatCargosForSearchResponse(
                cargos, uploadingPoint, downloadingPoint, searchLanguageId, defaultEconomicSettings, formattedCurrencyPriorities
            );
            const formattedCars = formatCarsForSearchResponse(cars);
            const itemsForClustering = formattedCargos.map(mapCargoForClustering).concat(formattedCars.map(mapCarForClustering));

            result.clusters = clusterizeItems(itemsForClustering, query);
            result.cars = formattedCars;
            result.cargos = formattedCargos;
        } else {
            if (showCargos) {
                const cargos = await CargosServices.getRecordsForSearch(coordinates, dates, searchRadius, searchLanguageId, companyId, showCargos, query);
                const formattedCargos = formatCargosForSearchResponse(
                    cargos, uploadingPoint, downloadingPoint, searchLanguageId, defaultEconomicSettings, formattedCurrencyPriorities
                );
                const itemsForClustering = formattedCargos.map(mapCargoForClustering);

                result.clusters = clusterizeItems(itemsForClustering, query);
                result.cars = [];
                result.cargos = formattedCargos;
            } else if (showCars) {
                const cars = await CarsServices.getRecordsForSearch(companyId, showCars, query);
                const formattedCars = formatCarsForSearchResponse(cars);
                const itemsForClustering = formattedCars.map(mapCarForClustering);
    
                result.clusters = clusterizeItems(itemsForClustering, query);
                result.cars = formattedCars;
                result.cargos = [];
            }
        }

        return success(res, result);
    } catch (error) {
        next(error);
    }
};

const searchAll = async (req, res, next) => {
    try {
        const { user, companyId } = res.locals;
        const { query } = req;
        const language = query[HOMELESS_COLUMNS.LANGUAGE_CODE];
        const itemsType = query[HOMELESS_COLUMNS.SEARCH_ITEMS];
        let languageCode = LANGUAGE_CODES_MAP.EN;
        if (user) {
            languageCode = user[HOMELESS_COLUMNS.LANGUAGE_CODE];
        } else if (language) {
            languageCode = language.slice(0, 2).toLowerCase();
        }
        const [userLanguage, defaultLanguage, defaultEconomicSettings, currencyPriorities] = await Promise.all([
            LanguagesServices.getLanguageByCode(languageCode),
            LanguagesServices.getLanguageByCodeStrict(LANGUAGE_CODES_MAP.EN),
            EconomicSettingsServices.getDefaultRecordStrict(),
            CurrencyPrioritiesServices.getRecords(),
        ]);
        const formattedCurrencyPriorities = formatQueueByPriority(
            currencyPriorities,
            colsCurrencyPriorities.CURRENCY_ID,
            colsCurrencyPriorities.NEXT_CURRENCY_ID
        );

        const searchLanguageId = (userLanguage && userLanguage.id) || defaultLanguage.id;

        const showCargos = itemsType === SEARCH_ITEMS_TYPES.CARGOS;
        const showCars = itemsType === SEARCH_ITEMS_TYPES.CARS;
        const result = {};

        if (companyId) {
            const [cargos, cars] = await Promise.all([
                CargosServices.getAllNewRecordsForSearch(searchLanguageId, companyId, showCargos),
                CarsServices.getAllNewRecordsForSearch(companyId, showCars)
            ]);
            const formattedCargos = formatCargosForSearchAllResponse(cargos, defaultEconomicSettings, formattedCurrencyPriorities);
            const formattedCars = formatCarsForSearchAllResponse(cars);
            const itemsForClustering = formattedCargos.map(mapCargoForClustering).concat(formattedCars.map(mapCarForClustering));

            result.clusters = clusterizeItems(itemsForClustering, query);
            result.cars = formattedCars;
            result.cargos = formattedCargos;
        } else {
            if (showCargos) {
                const cargos = await CargosServices.getAllNewRecordsForSearch(searchLanguageId, companyId, showCargos);
                const formattedCargos = formatCargosForSearchAllResponse(cargos, defaultEconomicSettings, formattedCurrencyPriorities);
                const itemsForClustering = formattedCargos.map(mapCargoForClustering);

                result.clusters = clusterizeItems(itemsForClustering, query);
                result.cars = [];
                result.cargos = formattedCargos;
            } else if (showCars) {
                const cars = await CarsServices.getAllNewRecordsForSearch(companyId, showCars);
                const formattedCars = formatCarsForSearchAllResponse(cars);
                const itemsForClustering = formattedCars.map(mapCarForClustering);
    
                result.clusters = clusterizeItems(itemsForClustering, query);
                result.cars = formattedCars;
                result.cargos = [];
            }
        }

        return success(res, result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    search,
    searchAll,
};
