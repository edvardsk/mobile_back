// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { SqlArray } = require('constants/instances');
const { CAR_TYPES_MAP } = require('constants/cars');

// formatters
const { mergeFilesWithDraft } = require('./files');

// helpers
const { isDangerous } = require('helpers/danger-classes');

// constants
const { DOCUMENTS } = require('constants/files');

const cols = SQL_TABLES.TRAILERS.COLUMNS;
const colsTrailersNumbers = SQL_TABLES.TRAILERS_STATE_NUMBERS.COLUMNS;
const colsCars = SQL_TABLES.CARS.COLUMNS;
const colsFiles = SQL_TABLES.FILES.COLUMNS;
const colsDraftFiles = SQL_TABLES.DRAFT_FILES.COLUMNS;
const colsDraftTrailers = SQL_TABLES.DRAFT_TRAILERS.COLUMNS;

const formatTrailerToSave = (companyId, trailerId, body, carId) => ({
    id: trailerId,
    [cols.COMPANY_ID]: companyId,
    [cols.CAR_ID]: carId,
    [cols.TRAILER_MARK]: body[cols.TRAILER_MARK],
    [cols.TRAILER_MODEL]: body[cols.TRAILER_MODEL],
    [cols.TRAILER_VIN]: body[cols.TRAILER_VIN],
    [cols.TRAILER_MADE_YEAR_AT]: body[cols.TRAILER_MADE_YEAR_AT],
    [cols.TRAILER_LOADING_METHODS]: new SqlArray(body[cols.TRAILER_LOADING_METHODS]),
    [cols.TRAILER_VEHICLE_TYPE_ID]: body[cols.TRAILER_VEHICLE_TYPE_ID],
    [cols.TRAILER_CARRYING_CAPACITY]: body[cols.TRAILER_CARRYING_CAPACITY],
    [cols.TRAILER_LENGTH]: body[cols.TRAILER_LENGTH],
    [cols.TRAILER_HEIGHT]: body[cols.TRAILER_HEIGHT],
    [cols.TRAILER_WIDTH]: body[cols.TRAILER_WIDTH],
    [cols.TRAILER_DANGER_CLASS_ID]: body[cols.TRAILER_DANGER_CLASS_ID],
});

const formatRecordForList = data => {
    const carryingCapacity = data[HOMELESS_COLUMNS.DRAFT_TRAILER_CARRYING_CAPACITY] || data[cols.TRAILER_CARRYING_CAPACITY];
    const length = data[HOMELESS_COLUMNS.DRAFT_TRAILER_LENGTH] || data[cols.TRAILER_LENGTH];
    const height = data[HOMELESS_COLUMNS.DRAFT_TRAILER_HEIGHT] || data[cols.TRAILER_HEIGHT];
    const width = data[HOMELESS_COLUMNS.DRAFT_TRAILER_WIDTH] || data[cols.TRAILER_WIDTH];

    return {
        id: data.id,
        [HOMELESS_COLUMNS.LINKED]: !!data[cols.CAR_ID],
        [cols.TRAILER_MARK]: data[HOMELESS_COLUMNS.DRAFT_TRAILER_MARK] || data[cols.TRAILER_MARK],
        [cols.TRAILER_MODEL]: data[HOMELESS_COLUMNS.DRAFT_TRAILER_MODEL] || data[cols.TRAILER_MODEL],
        [cols.TRAILER_VIN]: data[HOMELESS_COLUMNS.DRAFT_TRAILER_VIN] || data[cols.TRAILER_VIN],
        [cols.TRAILER_MADE_YEAR_AT]: data[HOMELESS_COLUMNS.DRAFT_TRAILER_MADE_YEAR_AT] || data[cols.TRAILER_MADE_YEAR_AT],
        [cols.TRAILER_LOADING_METHODS]: data[HOMELESS_COLUMNS.DRAFT_TRAILER_LOADING_METHODS] || data[cols.TRAILER_LOADING_METHODS],
        [cols.TRAILER_CARRYING_CAPACITY]: parseFloat(carryingCapacity),
        [cols.TRAILER_LENGTH]: parseFloat(length),
        [cols.TRAILER_HEIGHT]: parseFloat(height),
        [cols.TRAILER_WIDTH]: parseFloat(width),
        [HOMELESS_COLUMNS.VEHICLE_TYPE_NAME]: data[HOMELESS_COLUMNS.DRAFT_VEHICLE_TYPE_NAME] || data[HOMELESS_COLUMNS.VEHICLE_TYPE_NAME],
        [HOMELESS_COLUMNS.DANGER_CLASS_NAME]: data[HOMELESS_COLUMNS.DRAFT_DANGER_CLASS_NAME] || data[HOMELESS_COLUMNS.DANGER_CLASS_NAME],
        [HOMELESS_COLUMNS.TRAILER_STATE_NUMBER]: data[HOMELESS_COLUMNS.DRAFT_TRAILER_STATE_NUMBER] || data[HOMELESS_COLUMNS.TRAILER_STATE_NUMBER],
        [cols.TRAILER_VEHICLE_TYPE_ID]: data[HOMELESS_COLUMNS.DRAFT_TRAILER_VEHICLE_TYPE_ID] || data[cols.TRAILER_VEHICLE_TYPE_ID],
        [cols.TRAILER_DANGER_CLASS_ID]: data[HOMELESS_COLUMNS.DRAFT_TRAILER_DANGER_CLASS_ID] || data[cols.TRAILER_DANGER_CLASS_ID],
        [cols.VERIFIED]: data[cols.VERIFIED],
        [cols.SHADOW]: data[cols.SHADOW],
        [HOMELESS_COLUMNS.IS_DRAFT]: !!data[HOMELESS_COLUMNS.DRAFT_TRAILER_VIN],
    };
};

const formatRecordForListAvailable = data => {
    const result = {};
    const trailer = {
        id: data.id,
        [cols.TRAILER_MARK]: data[cols.TRAILER_MARK],
        [cols.TRAILER_MODEL]: data[cols.TRAILER_MODEL],
        [cols.TRAILER_VIN]: data[cols.TRAILER_VIN],
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
        [cols.VERIFIED]: data[cols.VERIFIED],
    };
    result.trailer = trailer;
    if (data[HOMELESS_COLUMNS.CAR_ID]) {
        let formattedCar = {
            id: data[HOMELESS_COLUMNS.CAR_ID],
            [colsCars.CAR_MARK]: data[colsCars.CAR_MARK],
            [colsCars.CAR_MODEL]: data[colsCars.CAR_MODEL],
            [colsCars.CAR_VIN]: data[colsCars.CAR_VIN],
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

const formatRecordForResponse = (trailer, isControlRole) => {
    const result = {};

    if (isControlRole) {
        result.trailer = {
            id: trailer.id,
            [HOMELESS_COLUMNS.LINKED]: !!trailer[cols.CAR_ID],
            [cols.CAR_ID]: trailer[cols.CAR_ID],
            [cols.TRAILER_MARK]: trailer[cols.TRAILER_MARK],
            [cols.TRAILER_MODEL]: trailer[cols.TRAILER_MODEL],
            [cols.TRAILER_VIN]: trailer[cols.TRAILER_VIN],
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
            [cols.VERIFIED]: trailer[cols.VERIFIED],
            [cols.SHADOW]: trailer[cols.SHADOW],
        };

        result.draftTrailer = {};
        result.files = formatTrailerFiles(trailer);
        result.draftFiles = [];

        if (trailer[HOMELESS_COLUMNS.DRAFT_TRAILER_VIN]) {
            result.draftTrailer = {
                [cols.TRAILER_MARK]: trailer[HOMELESS_COLUMNS.DRAFT_TRAILER_MARK],
                [cols.TRAILER_MODEL]: trailer[HOMELESS_COLUMNS.DRAFT_TRAILER_MODEL],
                [cols.TRAILER_VIN]: trailer[HOMELESS_COLUMNS.DRAFT_TRAILER_VIN],
                [cols.TRAILER_MADE_YEAR_AT]: trailer[HOMELESS_COLUMNS.DRAFT_TRAILER_MADE_YEAR_AT],
                [HOMELESS_COLUMNS.TRAILER_STATE_NUMBER]: trailer[HOMELESS_COLUMNS.DRAFT_TRAILER_STATE_NUMBER],
                [cols.TRAILER_LOADING_METHODS]: trailer[HOMELESS_COLUMNS.DRAFT_TRAILER_LOADING_METHODS],
                [cols.TRAILER_CARRYING_CAPACITY]: parseFloat(trailer[HOMELESS_COLUMNS.DRAFT_TRAILER_CARRYING_CAPACITY]),
                [cols.TRAILER_LENGTH]: parseFloat(trailer[HOMELESS_COLUMNS.DRAFT_TRAILER_LENGTH]),
                [cols.TRAILER_HEIGHT]: parseFloat(trailer[HOMELESS_COLUMNS.DRAFT_TRAILER_HEIGHT]),
                [cols.TRAILER_WIDTH]: parseFloat(trailer[HOMELESS_COLUMNS.DRAFT_TRAILER_WIDTH]),
                [cols.TRAILER_DANGER_CLASS_ID]: trailer[HOMELESS_COLUMNS.DRAFT_TRAILER_DANGER_CLASS_ID],
                [cols.TRAILER_VEHICLE_TYPE_ID]: trailer[HOMELESS_COLUMNS.DRAFT_TRAILER_VEHICLE_TYPE_ID],
                [HOMELESS_COLUMNS.DANGER_CLASS_NAME]: trailer[HOMELESS_COLUMNS.DRAFT_DANGER_CLASS_NAME],
                [HOMELESS_COLUMNS.VEHICLE_TYPE_NAME]: trailer[HOMELESS_COLUMNS.DRAFT_VEHICLE_TYPE_NAME],
                [colsDraftTrailers.COMMENTS]: trailer[colsDraftTrailers.COMMENTS],
            };
            result.draftFiles = formatDraftTrailerFiles(trailer);
        }
    } else {
        const carryingCapacity = trailer[HOMELESS_COLUMNS.DRAFT_TRAILER_CARRYING_CAPACITY] || trailer[cols.TRAILER_CARRYING_CAPACITY];
        const length = trailer[HOMELESS_COLUMNS.DRAFT_TRAILER_LENGTH] || trailer[cols.TRAILER_LENGTH];
        const height = trailer[HOMELESS_COLUMNS.DRAFT_TRAILER_HEIGHT] || trailer[cols.TRAILER_HEIGHT];
        const width = trailer[HOMELESS_COLUMNS.DRAFT_TRAILER_WIDTH] || trailer[cols.TRAILER_WIDTH];

        result.trailer = {
            id: trailer.id,
            [HOMELESS_COLUMNS.LINKED]: !!trailer[cols.CAR_ID],
            [cols.TRAILER_MARK]: trailer[HOMELESS_COLUMNS.DRAFT_TRAILER_MARK] || trailer[cols.TRAILER_MARK],
            [cols.TRAILER_MODEL]: trailer[HOMELESS_COLUMNS.DRAFT_TRAILER_MODEL] || trailer[cols.TRAILER_MODEL],
            [cols.TRAILER_VIN]: trailer[HOMELESS_COLUMNS.DRAFT_TRAILER_VIN] || trailer[cols.TRAILER_VIN],
            [cols.TRAILER_MADE_YEAR_AT]: trailer[HOMELESS_COLUMNS.DRAFT_TRAILER_MADE_YEAR_AT] || trailer[cols.TRAILER_MADE_YEAR_AT],
            [cols.TRAILER_LOADING_METHODS]: trailer[HOMELESS_COLUMNS.DRAFT_TRAILER_LOADING_METHODS] || trailer[cols.TRAILER_LOADING_METHODS],
            [cols.TRAILER_CARRYING_CAPACITY]: parseFloat(carryingCapacity),
            [cols.TRAILER_LENGTH]: parseFloat(length),
            [cols.TRAILER_HEIGHT]: parseFloat(height),
            [cols.TRAILER_WIDTH]: parseFloat(width),
            [HOMELESS_COLUMNS.VEHICLE_TYPE_NAME]: trailer[HOMELESS_COLUMNS.DRAFT_VEHICLE_TYPE_NAME] || trailer[HOMELESS_COLUMNS.VEHICLE_TYPE_NAME],
            [HOMELESS_COLUMNS.DANGER_CLASS_NAME]: trailer[HOMELESS_COLUMNS.DRAFT_DANGER_CLASS_NAME] || trailer[HOMELESS_COLUMNS.DANGER_CLASS_NAME],
            [HOMELESS_COLUMNS.TRAILER_STATE_NUMBER]: trailer[HOMELESS_COLUMNS.DRAFT_TRAILER_STATE_NUMBER] || trailer[HOMELESS_COLUMNS.TRAILER_STATE_NUMBER],
            [cols.TRAILER_VEHICLE_TYPE_ID]: trailer[HOMELESS_COLUMNS.DRAFT_TRAILER_VEHICLE_TYPE_ID] || trailer[cols.TRAILER_VEHICLE_TYPE_ID],
            [cols.TRAILER_DANGER_CLASS_ID]: trailer[HOMELESS_COLUMNS.DRAFT_TRAILER_DANGER_CLASS_ID] || trailer[cols.TRAILER_DANGER_CLASS_ID],
            [cols.VERIFIED]: trailer[cols.VERIFIED],
            [cols.SHADOW]: trailer[cols.SHADOW],
            [HOMELESS_COLUMNS.IS_DRAFT]: !!trailer[HOMELESS_COLUMNS.DRAFT_TRAILER_VIN],
            [colsDraftTrailers.COMMENTS]: trailer[colsDraftTrailers.COMMENTS],
        };

        result.files = formatTrailerFiles(trailer);

        const draftDangerClassName = trailer[HOMELESS_COLUMNS.DRAFT_DANGER_CLASS_NAME];
        const currentDangerClassName = trailer[cols.DANGER_CLASS_NAME];

        if (draftDangerClassName && isDangerous(currentDangerClassName) && !isDangerous(draftDangerClassName)) {
            result.files = result.files.filter(file => !file[colsFiles.LABELS].includes(DOCUMENTS.DANGER_CLASS));
        }

        if (trailer[HOMELESS_COLUMNS.DRAFT_FILES] && trailer[HOMELESS_COLUMNS.DRAFT_FILES].length) {
            const draftFiles = formatDraftTrailerFiles(trailer);
            result.files = mergeFilesWithDraft(result.files, draftFiles);
        }
    }

    return result;
};

const formatRecordForUnauthorizedResponse = (trailer) => {
    const result = {};

    const carryingCapacity = trailer[cols.TRAILER_CARRYING_CAPACITY];
    const length = trailer[cols.TRAILER_LENGTH];
    const height = trailer[cols.TRAILER_HEIGHT];
    const width = trailer[cols.TRAILER_WIDTH];

    result.trailer = {
        id: trailer.id,
        [HOMELESS_COLUMNS.LINKED]: !!trailer[cols.CAR_ID],
        [cols.TRAILER_MARK]: trailer[cols.TRAILER_MARK],
        [cols.TRAILER_MODEL]: trailer[cols.TRAILER_MODEL],
        [cols.TRAILER_VIN]: trailer[cols.TRAILER_VIN],
        [cols.TRAILER_MADE_YEAR_AT]: trailer[cols.TRAILER_MADE_YEAR_AT],
        [cols.TRAILER_LOADING_METHODS]: trailer[cols.TRAILER_LOADING_METHODS],
        [cols.TRAILER_CARRYING_CAPACITY]: parseFloat(carryingCapacity),
        [cols.TRAILER_LENGTH]: parseFloat(length),
        [cols.TRAILER_HEIGHT]: parseFloat(height),
        [cols.TRAILER_WIDTH]: parseFloat(width),
        [HOMELESS_COLUMNS.VEHICLE_TYPE_NAME]: trailer[HOMELESS_COLUMNS.VEHICLE_TYPE_NAME],
        [HOMELESS_COLUMNS.DANGER_CLASS_NAME]: trailer[HOMELESS_COLUMNS.DANGER_CLASS_NAME],
        [HOMELESS_COLUMNS.TRAILER_STATE_NUMBER]: trailer[HOMELESS_COLUMNS.TRAILER_STATE_NUMBER],
        [cols.TRAILER_VEHICLE_TYPE_ID]: trailer[cols.TRAILER_VEHICLE_TYPE_ID],
        [cols.TRAILER_DANGER_CLASS_ID]: trailer[cols.TRAILER_DANGER_CLASS_ID],
        [cols.VERIFIED]: trailer[cols.VERIFIED],
    };

    result.files = formatTrailerFiles(trailer);

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

const formatDraftTrailerFiles = data => {
    const files = data[HOMELESS_COLUMNS.DRAFT_FILES];
    return files.map(file => {
        const { f1, f2, f3, f4 } = file;
        return {
            id: f1,
            [colsDraftFiles.NAME]: f2,
            [colsDraftFiles.LABELS]: f3,
            [colsDraftFiles.URL]: f4,
        };
    });
};

const formatTrailerToEdit = body => ({
    [cols.TRAILER_MARK]: body[cols.TRAILER_MARK],
    [cols.TRAILER_MODEL]: body[cols.TRAILER_MODEL],
    [cols.TRAILER_VIN]: body[cols.TRAILER_VIN],
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
        [cols.SHADOW]: true,
    });
    trailersNumbers.push({
        [colsTrailersNumbers.TRAILER_ID]: trailerId,
        [colsTrailersNumbers.NUMBER]: item[HOMELESS_COLUMNS.TRAILER_STATE_NUMBER].toUpperCase(),
    });
    return acc;
},[[], []]);

const formatRecordAsNotVerified = (data = {}) => ({
    ...data,
    [cols.VERIFIED]: false,
});

const formatRecordAsVerified = (data = {}) => ({
    ...data,
    [cols.VERIFIED]: true,
});

const formatRecordAsNotShadow = (data = {}) => ({
    ...data,
    [cols.SHADOW]: false,
});

const formatRecordToUpdateFromDraft = draftTrailer => ({
    [cols.TRAILER_VIN]: draftTrailer[colsDraftTrailers.TRAILER_VIN],
    [cols.TRAILER_MARK]: draftTrailer[colsDraftTrailers.TRAILER_MARK],
    [cols.TRAILER_MODEL]: draftTrailer[colsDraftTrailers.TRAILER_MODEL],
    [cols.TRAILER_MADE_YEAR_AT]: draftTrailer[colsDraftTrailers.TRAILER_MADE_YEAR_AT],
    [cols.TRAILER_LOADING_METHODS]: new SqlArray(draftTrailer[colsDraftTrailers.TRAILER_LOADING_METHODS]),
    [cols.TRAILER_VEHICLE_TYPE_ID]: draftTrailer[colsDraftTrailers.TRAILER_VEHICLE_TYPE_ID],
    [cols.TRAILER_DANGER_CLASS_ID]: draftTrailer[colsDraftTrailers.TRAILER_DANGER_CLASS_ID],
    [cols.TRAILER_WIDTH]: draftTrailer[colsDraftTrailers.TRAILER_WIDTH],
    [cols.TRAILER_HEIGHT]: draftTrailer[colsDraftTrailers.TRAILER_HEIGHT],
    [cols.TRAILER_LENGTH]: draftTrailer[colsDraftTrailers.TRAILER_LENGTH],
    [cols.TRAILER_CARRYING_CAPACITY]: draftTrailer[colsDraftTrailers.TRAILER_CARRYING_CAPACITY],
});

module.exports = {
    formatTrailerToSave,
    formatRecordForList,
    formatRecordForListAvailable,
    formatRecordForResponse,
    formatRecordForUnauthorizedResponse,
    formatTrailerToEdit,
    formatShadowTrailersToSave,
    formatRecordAsNotVerified,
    formatRecordAsVerified,
    formatRecordAsNotShadow,
    formatRecordToUpdateFromDraft,
};
