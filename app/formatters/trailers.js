// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { SqlArray } = require('constants/instances');

const cols = SQL_TABLES.TRAILERS.COLUMNS;
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
    [cols.TRAILER_DANGER_CLASS_ID]: data[cols.TRAILER_DANGER_CLASS_ID],
});

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

module.exports = {
    formatTrailerToSave,
    formatRecordForList,
    formatRecordForResponse,
    formatTrailerToEdit,
};
