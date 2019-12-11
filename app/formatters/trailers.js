// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { SqlArray } = require('constants/instances');
const { CAR_TYPES_MAP } = require('constants/cars');

const cols = SQL_TABLES.TRAILERS.COLUMNS;
const colsTrailersNumbers = SQL_TABLES.TRAILERS_STATE_NUMBERS.COLUMNS;
const colsCars = SQL_TABLES.CARS.COLUMNS;
const colsFiles = SQL_TABLES.FILES.COLUMNS;

const formatTrailerToSave = (companyId, trailerId, body, carId) => ({
    id: trailerId,
    [cols.COMPANY_ID]: companyId,
    [cols.CAR_ID]: carId,
    [cols.TRAILER_MARK]: body[cols.TRAILER_MARK],
    [cols.TRAILER_MODEL]: body[cols.TRAILER_MODEL],
    [cols.TRAILER_MADE_YEAR_AT]: body[cols.TRAILER_MADE_YEAR_AT],
    [cols.TRAILER_LOADING_METHODS]: new SqlArray(body[cols.TRAILER_LOADING_METHODS]),
    [cols.TRAILER_VEHICLE_TYPE_ID]: body[cols.TRAILER_VEHICLE_TYPE_ID],
    [cols.TRAILER_CARRYING_CAPACITY]: body[cols.TRAILER_CARRYING_CAPACITY],
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
    [cols.TRAILER_CARRYING_CAPACITY]: parseFloat(data[cols.TRAILER_CARRYING_CAPACITY]),
    [cols.TRAILER_LENGTH]: parseFloat(data[cols.TRAILER_LENGTH]),
    [cols.TRAILER_HEIGHT]: parseFloat(data[cols.TRAILER_HEIGHT]),
    [cols.TRAILER_WIDTH]: parseFloat(data[cols.TRAILER_WIDTH]),
    [HOMELESS_COLUMNS.VEHICLE_TYPE_NAME]: data[HOMELESS_COLUMNS.VEHICLE_TYPE_NAME],
    [HOMELESS_COLUMNS.DANGER_CLASS_NAME]: data[HOMELESS_COLUMNS.DANGER_CLASS_NAME],
    [HOMELESS_COLUMNS.TRAILER_STATE_NUMBER]: data[HOMELESS_COLUMNS.TRAILER_STATE_NUMBER],
    [cols.TRAILER_DANGER_CLASS_ID]: data[cols.TRAILER_DANGER_CLASS_ID],
});

const formatRecordForListAvailable = data => {
    const result = {};
    const trailer = {
        id: data.id,
        [cols.TRAILER_MARK]: data[cols.TRAILER_MARK],
        [cols.TRAILER_MODEL]: data[cols.TRAILER_MODEL],
        [cols.TRAILER_MADE_YEAR_AT]: data[cols.TRAILER_MADE_YEAR_AT],
        [cols.TRAILER_LOADING_METHODS]: data[cols.TRAILER_LOADING_METHODS],
        [cols.TRAILER_VEHICLE_TYPE_ID]: data[cols.TRAILER_VEHICLE_TYPE_ID],
        [cols.TRAILER_CARRYING_CAPACITY]: parseFloat(data[cols.TRAILER_CARRYING_CAPACITY]),
        [cols.TRAILER_LENGTH]: parseFloat(data[cols.TRAILER_LENGTH]),
        [cols.TRAILER_HEIGHT]: parseFloat(data[cols.TRAILER_HEIGHT]),
        [cols.TRAILER_WIDTH]: parseFloat(data[cols.TRAILER_WIDTH]),
        [HOMELESS_COLUMNS.TRAILER_VEHICLE_TYPE_NAME]: data[HOMELESS_COLUMNS.TRAILER_VEHICLE_TYPE_NAME],
        [HOMELESS_COLUMNS.TRAILER_DANGER_CLASS_NAME]: data[HOMELESS_COLUMNS.TRAILER_DANGER_CLASS_NAME],
        [HOMELESS_COLUMNS.TRAILER_STATE_NUMBER]: data[HOMELESS_COLUMNS.TRAILER_STATE_NUMBER],
        [cols.TRAILER_DANGER_CLASS_ID]: data[cols.TRAILER_DANGER_CLASS_ID],
    };
    result.trailer = trailer;
    if (data[HOMELESS_COLUMNS.CAR_ID]) {
        let formattedCar = {
            id: data[HOMELESS_COLUMNS.CAR_ID],
            [colsCars.CAR_MARK]: data[colsCars.CAR_MARK],
            [colsCars.CAR_MODEL]: data[colsCars.CAR_MODEL],
            [colsCars.CAR_TYPE]: data[colsCars.CAR_TYPE],
            [colsCars.CAR_MADE_YEAR_AT]: data[colsCars.CAR_MADE_YEAR_AT],
            [HOMELESS_COLUMNS.CAR_STATE_NUMBER]: data[HOMELESS_COLUMNS.CAR_STATE_NUMBER],
        };
        result.car = formattedCar;

        if (data[colsCars.CAR_TYPE] === CAR_TYPES_MAP.TRUCK) {
            formattedCar = {
                ...formattedCar,
                [colsCars.CAR_LOADING_METHODS]: data[colsCars.CAR_LOADING_METHODS],
                [colsCars.CAR_CARRYING_CAPACITY]: parseFloat(data[colsCars.CAR_CARRYING_CAPACITY]),
                [colsCars.CAR_LENGTH]: parseFloat(data[colsCars.CAR_LENGTH]),
                [colsCars.CAR_HEIGHT]: parseFloat(data[colsCars.CAR_HEIGHT]),
                [colsCars.CAR_WIDTH]: parseFloat(data[colsCars.CAR_WIDTH]),
                [HOMELESS_COLUMNS.CAR_DANGER_CLASS_NAME]: data[HOMELESS_COLUMNS.CAR_DANGER_CLASS_NAME],
                [HOMELESS_COLUMNS.CAR_VEHICLE_TYPE_NAME]: data[HOMELESS_COLUMNS.CAR_VEHICLE_TYPE_NAME],
            };
            result.car = formattedCar;
        }
    }
    return result;
};

const formatRecordForResponse = trailer => {
    const result = {
        trailer: {
            data: {
                id: trailer.id,
                [HOMELESS_COLUMNS.LINKED]: !!trailer[cols.CAR_ID],
                [cols.CAR_ID]: trailer[cols.CAR_ID],
                [cols.TRAILER_MARK]: trailer[cols.TRAILER_MARK],
                [cols.TRAILER_MODEL]: trailer[cols.TRAILER_MODEL],
                [cols.TRAILER_MADE_YEAR_AT]: trailer[cols.TRAILER_MADE_YEAR_AT],
                [cols.TRAILER_LOADING_METHODS]: trailer[cols.TRAILER_LOADING_METHODS],
                [cols.TRAILER_VEHICLE_TYPE_ID]: trailer[cols.TRAILER_VEHICLE_TYPE_ID],
                [cols.TRAILER_CARRYING_CAPACITY]: parseFloat(trailer[cols.TRAILER_CARRYING_CAPACITY]),
                [cols.TRAILER_LENGTH]: parseFloat(trailer[cols.TRAILER_LENGTH]),
                [cols.TRAILER_HEIGHT]: parseFloat(trailer[cols.TRAILER_HEIGHT]),
                [cols.TRAILER_WIDTH]: parseFloat(trailer[cols.TRAILER_WIDTH]),
                [HOMELESS_COLUMNS.VEHICLE_TYPE_NAME]: trailer[HOMELESS_COLUMNS.VEHICLE_TYPE_NAME],
                [HOMELESS_COLUMNS.DANGER_CLASS_NAME]: trailer[HOMELESS_COLUMNS.DANGER_CLASS_NAME],
                [HOMELESS_COLUMNS.TRAILER_STATE_NUMBER]: trailer[HOMELESS_COLUMNS.TRAILER_STATE_NUMBER],
                [cols.TRAILER_DANGER_CLASS_ID]: trailer[cols.TRAILER_DANGER_CLASS_ID],
            },
        },
    };

    result.trailer.files = formatTrailerFiles(trailer);

    return result;
};

const formatTrailerFiles = data => {
    const files = data[HOMELESS_COLUMNS.FILES];
    return files.map(file => {
        const { f1, f2, f3, f4 } = file;
        return {
            id: f1,
            [colsFiles.NAME]: f2,
            [colsFiles.LABELS]: f3,
            [colsFiles.URL]: f4,
        };
    });
};

const formatTrailerToEdit = body => ({
    [cols.TRAILER_MARK]: body[cols.TRAILER_MARK],
    [cols.TRAILER_MODEL]: body[cols.TRAILER_MODEL],
    [cols.TRAILER_MADE_YEAR_AT]: body[cols.TRAILER_MADE_YEAR_AT],
    [cols.TRAILER_LOADING_METHODS]: new SqlArray(body[cols.TRAILER_LOADING_METHODS]),
    [cols.TRAILER_VEHICLE_TYPE_ID]: body[cols.TRAILER_VEHICLE_TYPE_ID],
    [cols.TRAILER_CARRYING_CAPACITY]: body[cols.TRAILER_CARRYING_CAPACITY],
    [cols.TRAILER_LENGTH]: body[cols.TRAILER_LENGTH],
    [cols.TRAILER_HEIGHT]: body[cols.TRAILER_HEIGHT],
    [cols.TRAILER_WIDTH]: body[cols.TRAILER_WIDTH],
    [cols.TRAILER_DANGER_CLASS_ID]: body[cols.TRAILER_DANGER_CLASS_ID],
});

const formatShadowTrailersToSave = (arr, companyId) => arr.reduce((acc, item) => {
    const [trailers, trailersNumbers] = acc;
    const trailerId = item[HOMELESS_COLUMNS.TRAILER_ID];
    trailers.push({
        id: trailerId,
        [cols.CAR_ID]: item[HOMELESS_COLUMNS.CAR_ID] || null,
        [cols.COMPANY_ID]: companyId,
    });
    trailersNumbers.push({
        [colsTrailersNumbers.TRAILER_ID]: trailerId,
        [colsTrailersNumbers.NUMBER]: item[HOMELESS_COLUMNS.TRAILER_STATE_NUMBER].toUpperCase(),
    });
    return acc;
},[[], []]);

module.exports = {
    formatTrailerToSave,
    formatRecordForList,
    formatRecordForListAvailable,
    formatRecordForResponse,
    formatTrailerToEdit,
    formatShadowTrailersToSave,
};
