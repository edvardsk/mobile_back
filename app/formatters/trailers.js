// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { SqlArray } = require('constants/instances');

const cols = SQL_TABLES.TRAILERS.COLUMNS;

const formatTrailerToSave = (companyId, trailerId, body, carId) => ({
    id: trailerId,
    [cols.COMPANY_ID]: companyId,
    [cols.CAR_ID]: carId,
    [cols.TRAILER_MARK]: body[cols.TRAILER_MARK],
    [cols.TRAILER_MODEL]: body[cols.TRAILER_MODEL],
    [cols.TRAILER_MADE_YEAR_AT]: body[cols.TRAILER_MADE_YEAR_AT],
    [cols.TRAILER_LOADING_METHODS]: new SqlArray(body[cols.TRAILER_LOADING_METHODS]),
    [cols.TRAILER_VEHICLE_TYPE_ID]: body[cols.TRAILER_VEHICLE_TYPE_ID],
    [cols.TRAILER_WEIGHT]: body[cols.TRAILER_WEIGHT],
    [cols.TRAILER_LENGTH]: body[cols.TRAILER_LENGTH],
    [cols.TRAILER_HEIGHT]: body[cols.TRAILER_HEIGHT],
    [cols.TRAILER_WIDTH]: body[cols.TRAILER_WIDTH],
    [cols.TRAILER_DANGER_CLASS_ID]: body[cols.TRAILER_DANGER_CLASS_ID],
});

const formatRecordForList = data => ({
    id: data.id,
    [HOMELESS_COLUMNS.LINKED]: !!data[cols.CAR_ID],
    [cols.TRAILER_MARK]: data[cols.TRAILER_MARK],
    [cols.TRAILER_MODEL]: data[cols.TRAILER_MODEL],
    [cols.TRAILER_MADE_YEAR_AT]: data[cols.TRAILER_MADE_YEAR_AT],
    [cols.TRAILER_LOADING_METHODS]: data[cols.TRAILER_LOADING_METHODS],
    [cols.TRAILER_VEHICLE_TYPE_ID]: data[cols.TRAILER_VEHICLE_TYPE_ID],
    [cols.TRAILER_WEIGHT]: parseFloat(data[cols.TRAILER_WEIGHT]),
    [cols.TRAILER_LENGTH]: parseFloat(data[cols.TRAILER_LENGTH]),
    [cols.TRAILER_HEIGHT]: parseFloat(data[cols.TRAILER_HEIGHT]),
    [cols.TRAILER_WIDTH]: parseFloat(data[cols.TRAILER_WIDTH]),
    [HOMELESS_COLUMNS.VEHICLE_TYPE_NAME]: data[HOMELESS_COLUMNS.VEHICLE_TYPE_NAME],
    [HOMELESS_COLUMNS.DANGER_CLASS_NAME]: data[HOMELESS_COLUMNS.DANGER_CLASS_NAME],
    [cols.TRAILER_DANGER_CLASS_ID]: data[cols.TRAILER_DANGER_CLASS_ID],
});

module.exports = {
    formatTrailerToSave,
    formatRecordForList,
};
