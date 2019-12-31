// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { SqlArray } = require('constants/instances');

const cols = SQL_TABLES.DRAFT_CARS.COLUMNS;
const colsCars = SQL_TABLES.CARS.COLUMNS;

const formatRecordToSave = (id, carId, body) => ({
    id,
    [cols.CAR_ID]: carId,
    [cols.CAR_VIN]: body[colsCars.CAR_VIN],
    [cols.CAR_STATE_NUMBER]: body[HOMELESS_COLUMNS.CAR_STATE_NUMBER].toUpperCase(),
    [cols.CAR_MARK]: body[colsCars.CAR_MARK],
    [cols.CAR_MODEL]: body[colsCars.CAR_MODEL],
    [cols.CAR_MADE_YEAR_AT]: body[colsCars.CAR_MADE_YEAR_AT],
    [cols.CAR_TYPE]: body[colsCars.CAR_TYPE],
    [cols.CAR_LOADING_METHODS]: (body[colsCars.CAR_LOADING_METHODS] && new SqlArray(body[colsCars.CAR_LOADING_METHODS])) || null,
    [cols.CAR_VEHICLE_TYPE_ID]: body[colsCars.CAR_VEHICLE_TYPE_ID] || null,
    [cols.CAR_DANGER_CLASS_ID]: body[colsCars.CAR_DANGER_CLASS_ID] || null,
    [cols.CAR_WIDTH]: body[colsCars.CAR_WIDTH] || null,
    [cols.CAR_HEIGHT]: body[colsCars.CAR_HEIGHT] || null,
    [cols.CAR_LENGTH]: body[colsCars.CAR_LENGTH] || null,
    [cols.CAR_CARRYING_CAPACITY]: body[colsCars.CAR_CARRYING_CAPACITY] || null,
});

const formatRecordToEdit = (body) => ({
    [cols.CAR_VIN]: body[colsCars.CAR_VIN],
    [cols.CAR_STATE_NUMBER]: body[HOMELESS_COLUMNS.CAR_STATE_NUMBER].toUpperCase(),
    [cols.CAR_MARK]: body[colsCars.CAR_MARK],
    [cols.CAR_MODEL]: body[colsCars.CAR_MODEL],
    [cols.CAR_MADE_YEAR_AT]: body[colsCars.CAR_MADE_YEAR_AT],
    [cols.CAR_TYPE]: body[colsCars.CAR_TYPE],
    [cols.CAR_LOADING_METHODS]: (body[colsCars.CAR_LOADING_METHODS] && new SqlArray(body[colsCars.CAR_LOADING_METHODS])) || null,
    [cols.CAR_VEHICLE_TYPE_ID]: body[colsCars.CAR_VEHICLE_TYPE_ID] || null,
    [cols.CAR_DANGER_CLASS_ID]: body[colsCars.CAR_DANGER_CLASS_ID] || null,
    [cols.CAR_WIDTH]: body[colsCars.CAR_WIDTH] || null,
    [cols.CAR_HEIGHT]: body[colsCars.CAR_HEIGHT] || null,
    [cols.CAR_LENGTH]: body[colsCars.CAR_LENGTH] || null,
    [cols.CAR_CARRYING_CAPACITY]: body[colsCars.CAR_CARRYING_CAPACITY] || null,
});

module.exports = {
    formatRecordToSave,
    formatRecordToEdit,
};
