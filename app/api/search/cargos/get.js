const { success } = require('api/response');

// services
const CargosServices = require('services/tables/cargos');
const LanguagesServices = require('services/tables/languages');
const EconomicSettingsServices = require('services/tables/economic-settings');

// constants
const { HOMELESS_COLUMNS } = require('constants/tables');
const { LANGUAGE_CODES_MAP } = require('constants/languages');
const { Geo, GeoLine } = require('constants/instances');

// formatters
const {
    formatRecordForSearchResponse,
    formatRecordForSearchAllResponse,
} = require('formatters/cargos');

// helpers
const { clusterizeCargos } = require('helpers/cluster');

const searchCargo = async (req, res, next) => {
    try {
        const { user } = res.locals;
        const { query } = req;
        const language = query[HOMELESS_COLUMNS.LANGUAGE_CODE];
        let languageCode = LANGUAGE_CODES_MAP.EN;
        if (user) {
            languageCode = user[HOMELESS_COLUMNS.LANGUAGE_CODE];
        } else if (language) {
            languageCode = language.slice(0, 2).toLowerCase();
        }
        const [userLanguage, defaultLanguage, defaultEconomicSettings] = await Promise.all([
            LanguagesServices.getLanguageByCode(languageCode),
            LanguagesServices.getLanguageByCodeStrict(LANGUAGE_CODES_MAP.EN),
            EconomicSettingsServices.getDefaultRecordStrict()
        ]);
        const searchLanguageId = (userLanguage && userLanguage.id) || defaultLanguage.id;
        const uploadingPoint = query[HOMELESS_COLUMNS.UPLOADING_POINT];
        const downloadingPoint = query[HOMELESS_COLUMNS.DOWNLOADING_POINT];
        const searchRadius = query[HOMELESS_COLUMNS.SEARCH_RADIUS];

        const upGeo = new Geo(uploadingPoint[HOMELESS_COLUMNS.LONGITUDE], uploadingPoint[HOMELESS_COLUMNS.LATITUDE]);
        const downGeo = new Geo(downloadingPoint[HOMELESS_COLUMNS.LONGITUDE], downloadingPoint[HOMELESS_COLUMNS.LATITUDE]);

        const geoLine = new GeoLine(
            uploadingPoint[HOMELESS_COLUMNS.LONGITUDE],
            uploadingPoint[HOMELESS_COLUMNS.LATITUDE],
            downloadingPoint[HOMELESS_COLUMNS.LONGITUDE],
            downloadingPoint[HOMELESS_COLUMNS.LATITUDE]
        );

        const coordinates = {
            upGeo,
            downGeo,
            geoLine,
        };

        const dates = {
            uploadingDate: query[HOMELESS_COLUMNS.UPLOADING_DATE],
            downloadingDate: query[HOMELESS_COLUMNS.DOWNLOADING_DATE],
        };

        const cargos = await CargosServices.getRecordsForSearch(coordinates, dates, searchRadius, searchLanguageId, query);
        const formattedCargos = formatRecordForSearchResponse(cargos, uploadingPoint, downloadingPoint, searchLanguageId, defaultEconomicSettings);
        const clusters = clusterizeCargos(formattedCargos, query);

        return success(res, {
            clusters,
            cargos: formattedCargos,
        });
    } catch (error) {
        next(error);
    }
};

const getAllNewCargos = async (req, res, next) => {
    try {
        const { user } = res.locals;
        const { query } = req;
        const language = query[HOMELESS_COLUMNS.LANGUAGE_CODE];
        let languageCode = LANGUAGE_CODES_MAP.EN;
        if (user) {
            languageCode = user[HOMELESS_COLUMNS.LANGUAGE_CODE];
        } else if (language) {
            languageCode = language.slice(0, 2).toLowerCase();
        }
        const [userLanguage, defaultLanguage, defaultEconomicSettings] = await Promise.all([
            LanguagesServices.getLanguageByCode(languageCode),
            LanguagesServices.getLanguageByCodeStrict(LANGUAGE_CODES_MAP.EN),
            EconomicSettingsServices.getDefaultRecordStrict()
        ]);
        const searchLanguageId = (userLanguage && userLanguage.id) || defaultLanguage.id;

        const cargos = await CargosServices.getAllNewRecordsForSearch(searchLanguageId);
        const formattedCargos = formatRecordForSearchAllResponse(cargos, defaultEconomicSettings);

        const clusters = clusterizeCargos(formattedCargos, query);

        return success(res, {
            clusters,
            cargos: formattedCargos,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    searchCargo,
    getAllNewCargos,
};
