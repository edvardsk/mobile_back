// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { SqlArray } = require('constants/instances');

const cols = SQL_TABLES.DEAL_CARS.COLUMNS;
const colsCars = SQL_TABLES.CARS.COLUMNS;

const formatRecordToSaveFromOriginal = (id, car) => ({
    id,
    [cols.CAR_ID]: car.id,
    [cols.CAR_VIN]: car[colsCars.CAR_VIN],
    [cols.CAR_STATE_NUMBER]: car[HOMELESS_COLUMNS.CAR_STATE_NUMBER],
    [cols.CAR_MARK]: car[colsCars.CAR_MARK],
    [cols.CAR_MODEL]: car[colsCars.CAR_MODEL],
    [cols.CAR_MADE_YEAR_AT]: car[colsCars.CAR_MADE_YEAR_AT],
    [cols.CAR_TYPE]: car[colsCars.CAR_TYPE],
    [cols.CAR_LOADING_METHODS]: (car[colsCars.CAR_LOADING_METHODS] && new SqlArray(car[colsCars.CAR_LOADING_METHODS])) || null,
    [cols.CAR_VEHICLE_TYPE_ID]: car[colsCars.CAR_VEHICLE_TYPE_ID] || null,
    [cols.CAR_DANGER_CLASS_ID]: car[colsCars.CAR_DANGER_CLASS_ID] || null,
    [cols.CAR_WIDTH]: car[colsCars.CAR_WIDTH] || null,
    [cols.CAR_HEIGHT]: car[colsCars.CAR_HEIGHT] || null,
    [cols.CAR_LENGTH]: car[colsCars.CAR_LENGTH] || null,
    [cols.CAR_CARRYING_CAPACITY]: car[colsCars.CAR_CARRYING_CAPACITY] || null,
});

module.exports = {
    formatRecordToSaveFromOriginal,
};
