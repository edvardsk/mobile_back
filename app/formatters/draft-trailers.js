// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { SqlArray } = require('constants/instances');

const cols = SQL_TABLES.DRAFT_TRAILERS.COLUMNS;
const colsTrailers = SQL_TABLES.TRAILERS.COLUMNS;

const formatRecordToSave = (id, trailerId, body) => ({
    id,
    [cols.TRAILER_ID]: trailerId,
    [cols.TRAILER_VIN]: body[colsTrailers.TRAILER_VIN],
    [cols.TRAILER_STATE_NUMBER]: body[HOMELESS_COLUMNS.TRAILER_STATE_NUMBER],
    [cols.TRAILER_MARK]: body[colsTrailers.TRAILER_MARK],
    [cols.TRAILER_MODEL]: body[colsTrailers.TRAILER_MODEL],
    [cols.TRAILER_MADE_YEAR_AT]: body[colsTrailers.TRAILER_MADE_YEAR_AT],
    [cols.TRAILER_LOADING_METHODS]: new SqlArray(body[colsTrailers.TRAILER_LOADING_METHODS]),
    [cols.TRAILER_VEHICLE_TYPE_ID]: body[colsTrailers.TRAILER_VEHICLE_TYPE_ID],
    [cols.TRAILER_DANGER_CLASS_ID]: body[colsTrailers.TRAILER_DANGER_CLASS_ID],
    [cols.TRAILER_WIDTH]: body[colsTrailers.TRAILER_WIDTH],
    [cols.TRAILER_HEIGHT]: body[colsTrailers.TRAILER_HEIGHT],
    [cols.TRAILER_LENGTH]: body[colsTrailers.TRAILER_LENGTH],
    [cols.TRAILER_CARRYING_CAPACITY]: body[colsTrailers.TRAILER_CARRYING_CAPACITY],
});

const formatRecordToEdit = (body) => ({
    [cols.TRAILER_VIN]: body[colsTrailers.TRAILER_VIN],
    [cols.TRAILER_STATE_NUMBER]: body[HOMELESS_COLUMNS.TRAILER_STATE_NUMBER],
    [cols.TRAILER_MARK]: body[colsTrailers.TRAILER_MARK],
    [cols.TRAILER_MODEL]: body[colsTrailers.TRAILER_MODEL],
    [cols.TRAILER_MADE_YEAR_AT]: body[colsTrailers.TRAILER_MADE_YEAR_AT],
    [cols.TRAILER_LOADING_METHODS]: new SqlArray(body[colsTrailers.TRAILER_LOADING_METHODS]),
    [cols.TRAILER_VEHICLE_TYPE_ID]: body[colsTrailers.TRAILER_VEHICLE_TYPE_ID],
    [cols.TRAILER_DANGER_CLASS_ID]: body[colsTrailers.TRAILER_DANGER_CLASS_ID],
    [cols.TRAILER_WIDTH]: body[colsTrailers.TRAILER_WIDTH],
    [cols.TRAILER_HEIGHT]: body[colsTrailers.TRAILER_HEIGHT],
    [cols.TRAILER_LENGTH]: body[colsTrailers.TRAILER_LENGTH],
    [cols.TRAILER_CARRYING_CAPACITY]: body[colsTrailers.TRAILER_CARRYING_CAPACITY],
});

module.exports = {
    formatRecordToSave,
    formatRecordToEdit,
};
