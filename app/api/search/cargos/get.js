const Supercluster = require('supercluster');
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
        // const searchRadius = query[HOMELESS_COLUMNS.SEARCH_RADIUS];
        const searchRadius = 5000; // todo: delete it

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
        const formatterCargos = formatRecordForSearchResponse(cargos, uploadingPoint, downloadingPoint, searchLanguageId);
        const index = new Supercluster({
            radius: 200,
            maxZoom: 16,
            extent: 256,
        });

        const goeCargo = formatterCargos.map(cargo => ({
            type: 'Feature',
            properties: {
                id: cargo['id'],
            },
            geometry: {
                id: cargo['id'],
                type: 'Point',
                coordinates: [cargo['uploading_points'][0][HOMELESS_COLUMNS.LONGITUDE], cargo['uploading_points'][0][HOMELESS_COLUMNS.LATITUDE]],
            },
        }));

        index.load(goeCargo);

        const clusterSW = query[HOMELESS_COLUMNS.CLUSTER_SW];
        const clusterNE = query[HOMELESS_COLUMNS.CLUSTER_NE];
        const clusterZoom = query[HOMELESS_COLUMNS.ZOOM];

        const clusters = index.getClusters([
            parseFloat(clusterSW[HOMELESS_COLUMNS.LONGITUDE]),
            parseFloat(clusterSW[HOMELESS_COLUMNS.LATITUDE]),
            parseFloat(clusterNE[HOMELESS_COLUMNS.LONGITUDE]),
            parseFloat(clusterNE[HOMELESS_COLUMNS.LATITUDE])
        ], clusterZoom);

        clusters.forEach((cluster, i) => {
            if (cluster.id) {
                const deepData = index.getLeaves(cluster.id);
                clusters[i]['properties']['ids'] = deepData.map(data => data['properties']['id']);
            }
        });

        return success(res, {
            clusters,
            cargos: formatterCargos,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    searchCargo,
};
