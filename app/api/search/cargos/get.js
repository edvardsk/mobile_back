const { success } = require('api/response');

// services
const CargosServices = require('services/tables/cargos');
const LanguagesServices = require('services/tables/languages');

// constants
const { HOMELESS_COLUMNS } = require('constants/tables');
const { LANGUAGE_CODES_MAP } = require('constants/languages');
const { Geo, GeoLine } = require('constants/instances');

// formatters
const { formatRecordForSearchResponse } = require('formatters/cargos');

const searchCargo = async (req, res, next) => {
    try {
        const { user } = res.locals;
        const { query } = req;
        const { language } = query;
        let languageCode = LANGUAGE_CODES_MAP.EN;
        if (user) {
            languageCode = user[HOMELESS_COLUMNS.LANGUAGE_CODE];
        } else if (language) {
            languageCode = language.slice(0, 2).toLowerCase();
        }
        const [userLanguage, defaultLanguage] = await Promise.all([
            LanguagesServices.getLanguageByCode(languageCode),
            LanguagesServices.getLanguageByCodeStrict(LANGUAGE_CODES_MAP.EN),
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

        return success(res, { cargos: formatRecordForSearchResponse(cargos, uploadingPoint, downloadingPoint, searchLanguageId) });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    searchCargo,
};
