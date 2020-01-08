// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { Geo } = require('constants/instances');

// formatters
const { formatGeoPointToObject } = require('./geo');

const cols = SQL_TABLES.CAR_POINTS.COLUMNS;

const formatRecordToSave = (id, dealId, carId, trailerId, coordinates) => ({
    id: id,
    [cols.DEAL_ID]: dealId,
    [cols.CAR_ID]: carId,
    [cols.TRAILER_ID]: trailerId,
    [cols.COORDINATES]: new Geo(coordinates[HOMELESS_COLUMNS.LONGITUDE], coordinates[HOMELESS_COLUMNS.LATITUDE]),
});

const formatPoinstForList = (point) => ({
    id: point.id,
    [cols.COORDINATES]: formatGeoPointToObject(point.row_to_json.f1),
    [cols.CREATED_AT]: point[cols.CREATED_AT],
});

module.exports = {
    formatRecordToSave,
    formatPoinstForList,
};
