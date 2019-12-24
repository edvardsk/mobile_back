const { HOMELESS_COLUMNS, SQL_TABLES } = require('constants/tables');
const { Geo } = require('constants/instances');

const colsRoutes = SQL_TABLES.ROUTES.COLUMNS;

const formatGeoDataValuesWithNamesToSave = values => values.reduce((acc, value) => {
    const coordinatesFrom = value.coordinates_from;
    const coordinatesTo = value.coordinates_to;
    acc.push({
        [HOMELESS_COLUMNS.COORDINATES]: new Geo(coordinatesFrom[HOMELESS_COLUMNS.LONGITUDE], coordinatesFrom[HOMELESS_COLUMNS.LATITUDE]).toPointString(),
        [HOMELESS_COLUMNS.NAME_EN]: coordinatesFrom[HOMELESS_COLUMNS.NAME_EN],
    });
    acc.push({
        [HOMELESS_COLUMNS.COORDINATES]: new Geo(coordinatesTo[HOMELESS_COLUMNS.LONGITUDE], coordinatesTo[HOMELESS_COLUMNS.LATITUDE]).toPointString(),
        [HOMELESS_COLUMNS.NAME_EN]: coordinatesTo[HOMELESS_COLUMNS.NAME_EN],
    });
    return acc;
}, []);

const formatGeoDataValuesToSave = values => values.map(value => formatGeoDataValueToSave(value));

const formatGeoDataValueToSave = value => {
    const coordinatesFrom = value.coordinates_from;
    const coordinatesTo = value.coordinates_to;
    return {
        [colsRoutes.COORDINATES_FROM]: new Geo(coordinatesFrom[HOMELESS_COLUMNS.LONGITUDE], coordinatesFrom[HOMELESS_COLUMNS.LATITUDE]),
        [colsRoutes.COORDINATES_TO]: new Geo(coordinatesTo[HOMELESS_COLUMNS.LONGITUDE], coordinatesTo[HOMELESS_COLUMNS.LATITUDE]),
    };
};

const formatGeoPointToObject = string => {
    const [longitude, latitude] = string.slice(6, -1).split(' ');
    return {
        [HOMELESS_COLUMNS.LONGITUDE]: longitude,
        [HOMELESS_COLUMNS.LATITUDE]: latitude
    };
};

const formatGeoPointToObjectWithTranslation = (string, translation) => {
    const [longitude, latitude] = string.slice(6, -1).split(' ');
    return {
        [HOMELESS_COLUMNS.LONGITUDE]: longitude,
        [HOMELESS_COLUMNS.LATITUDE]: latitude,
        [HOMELESS_COLUMNS.CITY_NAME]: translation,
    };
};

const formatGeoPointWithNameFromPostgresJSONToObject = obj => {
    const cargoPointId = obj.f1;
    const coordinatesString = obj.f2;
    const cityName = obj.f3;
    const languageId = obj.f4;
    return {
        id: cargoPointId,
        [HOMELESS_COLUMNS.COORDINATES]: coordinatesString,
        [HOMELESS_COLUMNS.CITY_NAME]: cityName,
        languageId,
    };
};

const formatGeoPointWithName = data => {
    const coordinatesString = data[HOMELESS_COLUMNS.COORDINATES];
    const [longitude, latitude] = coordinatesString.slice(6, -1).split(' ');
    return {
        id: data.id,
        [HOMELESS_COLUMNS.LONGITUDE]: longitude,
        [HOMELESS_COLUMNS.LATITUDE]: latitude,
        [HOMELESS_COLUMNS.CITY_NAME]: data[HOMELESS_COLUMNS.CITY_NAME],
        [HOMELESS_COLUMNS.NAME_EN]: data[HOMELESS_COLUMNS.NAME_EN],
        languageId: data['languageId'],
    };
};

module.exports = {
    formatGeoDataValuesWithNamesToSave,
    formatGeoDataValuesToSave,
    formatGeoPointToObject,
    formatGeoPointToObjectWithTranslation,
    formatGeoPointWithNameFromPostgresJSONToObject,
    formatGeoPointWithName,
};
