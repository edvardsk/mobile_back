const { HOMELESS_COLUMNS, SQL_TABLES } = require('constants/tables');

const colsRoutes = SQL_TABLES.ROUTES.COLUMNS;

const formatGeoDataValuesToSave = values => values.map(value => formatGeoDataValueToSave(value));

const formatGeoDataValueToSave = value => {
    const coordinatesFrom = value.coordinates_from;
    const coordinatesTo = value.coordinates_to;
    return {
        [colsRoutes.COORDINATES_FROM]: `ST_GeometryFromText('Point(${coordinatesFrom[HOMELESS_COLUMNS.LONGITUDE]} ${coordinatesFrom[HOMELESS_COLUMNS.LATITUDE]})')`,
        [colsRoutes.COORDINATES_TO]: `ST_GeometryFromText('Point(${coordinatesTo[HOMELESS_COLUMNS.LONGITUDE]} ${coordinatesTo[HOMELESS_COLUMNS.LATITUDE]})')`,
    };

};

module.exports = {
    formatGeoDataValuesToSave,
};
