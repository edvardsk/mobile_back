const { success } = require('api/response');

// services
const CargosServices = require('services/tables/cargos');
const LanguagesServices = require('services/tables/languages');

// constants
const { HOMELESS_COLUMNS } = require('constants/tables');
const { LANGUAGE_CODES_MAP } = require('constants/languages');
const { Geo, GeoLine } = require('constants/instances');

// formatters
const { formatRecordForList } = require('formatters/cargos');

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

        const upGeo = new Geo(uploadingPoint.longitude, uploadingPoint.latitude);
        const downGeo = new Geo(downloadingPoint.longitude, downloadingPoint.latitude);

        const geoLine = new GeoLine(uploadingPoint.longitude, uploadingPoint.latitude, downloadingPoint.longitude, downloadingPoint.latitude);

        const coordinates = {
            upGeo,
            downGeo,
            geoLine,
        };

        const dates = {
            uploadingDate: query[HOMELESS_COLUMNS.UPLOADING_DATE],
            downloadingDate: query[HOMELESS_COLUMNS.DOWNLOADING_DATE],
        };

        const cargos = await CargosServices.getRecordsForSearch(coordinates, dates, searchLanguageId);
        const filtered = cargos
            .filter(cargo => cargo[HOMELESS_COLUMNS.UPLOADING_POINTS].length === cargo[HOMELESS_COLUMNS.ALL_UPLOADING_POINTS].length &&
                cargo[HOMELESS_COLUMNS.DOWNLOADING_POINTS].length === cargo[HOMELESS_COLUMNS.ALL_DOWNLOADING_POINTS].length
            )
            .map(cargo => formatRecordForList(cargo, searchLanguageId));

        return success(res, { cargos: filtered });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    searchCargo,
};
