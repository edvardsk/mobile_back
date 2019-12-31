// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { SqlArray } = require('constants/instances');

const cols = SQL_TABLES.DEAL_TRAILERS.COLUMNS;
const colsTrailers = SQL_TABLES.TRAILERS.COLUMNS;

const formatRecordToSaveFromOriginal = (id, trailer) => ({
    id,
    [cols.TRAILER_ID]: trailer.id,
    [cols.TRAILER_VIN]: trailer[colsTrailers.TRAILER_VIN],
    [cols.TRAILER_STATE_NUMBER]: trailer[HOMELESS_COLUMNS.TRAILER_STATE_NUMBER].toUpperCase(),
    [cols.TRAILER_MARK]: trailer[colsTrailers.TRAILER_MARK],
    [cols.TRAILER_MODEL]: trailer[colsTrailers.TRAILER_MODEL],
    [cols.TRAILER_MADE_YEAR_AT]: trailer[colsTrailers.TRAILER_MADE_YEAR_AT],
    [cols.TRAILER_LOADING_METHODS]: new SqlArray(trailer[colsTrailers.TRAILER_LOADING_METHODS]),
    [cols.TRAILER_VEHICLE_TYPE_ID]: trailer[colsTrailers.TRAILER_VEHICLE_TYPE_ID],
    [cols.TRAILER_DANGER_CLASS_ID]: trailer[colsTrailers.TRAILER_DANGER_CLASS_ID],
    [cols.TRAILER_WIDTH]: trailer[colsTrailers.TRAILER_WIDTH],
    [cols.TRAILER_HEIGHT]: trailer[colsTrailers.TRAILER_HEIGHT],
    [cols.TRAILER_LENGTH]: trailer[colsTrailers.TRAILER_LENGTH],
    [cols.TRAILER_CARRYING_CAPACITY]: trailer[colsTrailers.TRAILER_CARRYING_CAPACITY],
});

module.exports = {
    formatRecordToSaveFromOriginal,
};
