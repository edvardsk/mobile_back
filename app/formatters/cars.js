// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { CAR_TYPES_MAP } = require('constants/cars');
const { SqlArray } = require('constants/instances');

const cols = SQL_TABLES.CARS.COLUMNS;

const formatCarToSave = (id, companyId, body) => {
    const carType = body[cols.CAR_TYPE];
    let car = {
        id,
        [cols.COMPANY_ID]: companyId,
        [cols.CAR_MARK]: body[cols.CAR_MARK],
        [cols.CAR_MODEL]: body[cols.CAR_MODEL],
        [cols.CAR_MADE_YEAR_AT]: body[cols.CAR_MADE_YEAR_AT],
        [cols.CAR_TYPE]: carType,
    };
    if (carType === CAR_TYPES_MAP.TRUCK) {
        car = {
            ...car,
            [cols.CAR_LOADING_METHODS]: new SqlArray(body[cols.CAR_LOADING_METHODS]),
            [cols.CAR_VEHICLE_TYPE_ID]: body[cols.CAR_VEHICLE_TYPE_ID],
            [cols.CAR_WEIGHT]: body[cols.CAR_WEIGHT],
            [cols.CAR_LENGTH]: body[cols.CAR_LENGTH],
            [cols.CAR_HEIGHT]: body[cols.CAR_HEIGHT],
            [cols.CAR_WIDTH]: body[cols.CAR_WIDTH],
            [cols.CAR_DANGER_CLASS_ID]: body[cols.CAR_DANGER_CLASS_ID] || null,
        };
    }
    return car;
};

const formatRecordForList = car => ({
    id: car.id,
    [cols.CAR_MARK]: car[cols.CAR_MARK],
    [cols.CAR_MODEL]: car[cols.CAR_MODEL],
    [cols.CAR_TYPE]: car[cols.CAR_TYPE],
    [cols.CAR_MADE_YEAR_AT]: car[cols.CAR_MADE_YEAR_AT],
    [HOMELESS_COLUMNS.CAR_STATE_NUMBER]: car[HOMELESS_COLUMNS.CAR_STATE_NUMBER],
    [cols.CREATED_AT]: car[cols.CREATED_AT],
});

module.exports = {
    formatCarToSave,
    formatRecordForList,
};
