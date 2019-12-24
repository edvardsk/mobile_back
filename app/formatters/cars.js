// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { CAR_TYPES_MAP } = require('constants/cars');
const { SqlArray } = require('constants/instances');

// formatters
const { mergeFilesWithDraft } = require('./files');

const cols = SQL_TABLES.CARS.COLUMNS;
const colsCarsNumbers = SQL_TABLES.CARS_STATE_NUMBERS.COLUMNS;
const colsTrailers = SQL_TABLES.TRAILERS.COLUMNS;
const colsFiles = SQL_TABLES.FILES.COLUMNS;
const colsDraftFiles = SQL_TABLES.DRAFT_FILES.COLUMNS;
const colsDraftCars = SQL_TABLES.DRAFT_CARS.COLUMNS;

const formatCarToSave = (id, companyId, body) => {
    const carType = body[cols.CAR_TYPE];
    let car = {
        id,
        [cols.COMPANY_ID]: companyId,
        [cols.CAR_MARK]: body[cols.CAR_MARK],
        [cols.CAR_MODEL]: body[cols.CAR_MODEL],
        [cols.CAR_VIN]: body[cols.CAR_VIN],
        [cols.CAR_MADE_YEAR_AT]: body[cols.CAR_MADE_YEAR_AT],
        [cols.CAR_TYPE]: carType,
    };
    if (carType === CAR_TYPES_MAP.TRUCK) {
        car = {
            ...car,
            [cols.CAR_LOADING_METHODS]: new SqlArray(body[cols.CAR_LOADING_METHODS]),
            [cols.CAR_VEHICLE_TYPE_ID]: body[cols.CAR_VEHICLE_TYPE_ID],
            [cols.CAR_CARRYING_CAPACITY]: body[cols.CAR_CARRYING_CAPACITY],
            [cols.CAR_LENGTH]: body[cols.CAR_LENGTH],
            [cols.CAR_HEIGHT]: body[cols.CAR_HEIGHT],
            [cols.CAR_WIDTH]: body[cols.CAR_WIDTH],
            [cols.CAR_DANGER_CLASS_ID]: body[cols.CAR_DANGER_CLASS_ID] || null,
        };
    }
    return car;
};

const formatCarToEdit = (body) => {
    const carType = body[cols.CAR_TYPE];
    let car = {
        [cols.CAR_MARK]: body[cols.CAR_MARK],
        [cols.CAR_MODEL]: body[cols.CAR_MODEL],
        [cols.CAR_VIN]: body[cols.CAR_VIN],
        [cols.CAR_MADE_YEAR_AT]: body[cols.CAR_MADE_YEAR_AT],
        [cols.CAR_TYPE]: carType,
        [cols.CAR_LOADING_METHODS]: null,
        [cols.CAR_VEHICLE_TYPE_ID]: null,
        [cols.CAR_CARRYING_CAPACITY]: null,
        [cols.CAR_LENGTH]: null,
        [cols.CAR_HEIGHT]: null,
        [cols.CAR_WIDTH]: null,
        [cols.CAR_DANGER_CLASS_ID]: null,
        [cols.VERIFIED]: true,
        [cols.SHADOW]: false,
    };
    if (carType === CAR_TYPES_MAP.TRUCK) {
        car = {
            ...car,
            [cols.CAR_LOADING_METHODS]: new SqlArray(body[cols.CAR_LOADING_METHODS]),
            [cols.CAR_VEHICLE_TYPE_ID]: body[cols.CAR_VEHICLE_TYPE_ID],
            [cols.CAR_CARRYING_CAPACITY]: body[cols.CAR_CARRYING_CAPACITY],
            [cols.CAR_LENGTH]: body[cols.CAR_LENGTH],
            [cols.CAR_HEIGHT]: body[cols.CAR_HEIGHT],
            [cols.CAR_WIDTH]: body[cols.CAR_WIDTH],
            [cols.CAR_DANGER_CLASS_ID]: body[cols.CAR_DANGER_CLASS_ID] || null,
        };
    }
    return car;
};

const formatRecordForList = car => {
    let result = {
        id: car.id,
        [cols.CAR_MARK]: car[HOMELESS_COLUMNS.DRAFT_CAR_MARK] || car[cols.CAR_MARK],
        [cols.CAR_MODEL]: car[HOMELESS_COLUMNS.DRAFT_CAR_MODEL] || car[cols.CAR_MODEL],
        [cols.CAR_VIN]: car[HOMELESS_COLUMNS.DRAFT_CAR_VIN] || car[cols.CAR_VIN],
        [cols.CAR_TYPE]: car[HOMELESS_COLUMNS.DRAFT_CAR_TYPE] || car[cols.CAR_TYPE],
        [cols.CAR_MADE_YEAR_AT]: car[HOMELESS_COLUMNS.DRAFT_CAR_MADE_YEAR_AT] || car[cols.CAR_MADE_YEAR_AT],
        [HOMELESS_COLUMNS.CAR_STATE_NUMBER]: car[HOMELESS_COLUMNS.DRAFT_CAR_STATE_NUMBER] || car[HOMELESS_COLUMNS.CAR_STATE_NUMBER],
        [cols.CREATED_AT]: car[cols.CREATED_AT],
        [HOMELESS_COLUMNS.CAR_VERIFIED]: car[cols.VERIFIED],
        [HOMELESS_COLUMNS.CAR_IS_DRAFT]: !!car[HOMELESS_COLUMNS.DRAFT_CAR_MARK],
    };
    if (car[HOMELESS_COLUMNS.TRAILER_ID]) {
        result = {
            ...result,
            [HOMELESS_COLUMNS.TRAILER_ID]: car[HOMELESS_COLUMNS.TRAILER_ID],
            [colsTrailers.TRAILER_MARK]: car[colsTrailers.TRAILER_MARK],
            [colsTrailers.TRAILER_MODEL]: car[colsTrailers.TRAILER_MODEL],
            [colsTrailers.TRAILER_WIDTH]: parseFloat(car[colsTrailers.TRAILER_WIDTH]),
            [colsTrailers.TRAILER_HEIGHT]: parseFloat(car[colsTrailers.TRAILER_HEIGHT]),
            [colsTrailers.TRAILER_LENGTH]: parseFloat(car[colsTrailers.TRAILER_LENGTH]),
            [colsTrailers.TRAILER_CARRYING_CAPACITY]: parseFloat(car[colsTrailers.TRAILER_CARRYING_CAPACITY]),
            [HOMELESS_COLUMNS.TRAILER_DANGER_CLASS_NAME]: car[HOMELESS_COLUMNS.TRAILER_DANGER_CLASS_NAME],
            [HOMELESS_COLUMNS.TRAILER_VEHICLE_TYPE_NAME]: car[HOMELESS_COLUMNS.TRAILER_VEHICLE_TYPE_NAME],
            [HOMELESS_COLUMNS.TRAILER_STATE_NUMBER]: car[HOMELESS_COLUMNS.TRAILER_STATE_NUMBER],
            [HOMELESS_COLUMNS.TRAILER_VERIFIED]: car[HOMELESS_COLUMNS.TRAILER_VERIFIED],
        };
    }
    return result;
};

const formatRecordForListAvailable = car => {
    const result = {};
    let formattedCar = {
        id: car.id,
        [cols.CAR_MARK]: car[cols.CAR_MARK],
        [cols.CAR_MODEL]: car[cols.CAR_MODEL],
        [cols.CAR_VIN]: car[cols.CAR_VIN],
        [cols.CAR_TYPE]: car[cols.CAR_TYPE],
        [cols.CAR_MADE_YEAR_AT]: car[cols.CAR_MADE_YEAR_AT],
        [HOMELESS_COLUMNS.CAR_STATE_NUMBER]: car[HOMELESS_COLUMNS.CAR_STATE_NUMBER],
        [cols.CREATED_AT]: car[cols.CREATED_AT],
    };
    result.car = formattedCar;

    if (car[cols.CAR_TYPE] === CAR_TYPES_MAP.TRUCK) {
        formattedCar = {
            ...formattedCar,
            [cols.CAR_LOADING_METHODS]: car[cols.CAR_LOADING_METHODS],
            [cols.CAR_CARRYING_CAPACITY]: parseFloat(car[cols.CAR_CARRYING_CAPACITY]),
            [cols.CAR_LENGTH]: parseFloat(car[cols.CAR_LENGTH]),
            [cols.CAR_HEIGHT]: parseFloat(car[cols.CAR_HEIGHT]),
            [cols.CAR_WIDTH]: parseFloat(car[cols.CAR_WIDTH]),
            [HOMELESS_COLUMNS.CAR_DANGER_CLASS_NAME]: car[HOMELESS_COLUMNS.CAR_DANGER_CLASS_NAME],
            [HOMELESS_COLUMNS.CAR_VEHICLE_TYPE_NAME]: car[HOMELESS_COLUMNS.CAR_VEHICLE_TYPE_NAME],
        };
        result.car = formattedCar;
    }

    if (car[HOMELESS_COLUMNS.TRAILER_ID]) {
        const trailer = {
            id: car[HOMELESS_COLUMNS.TRAILER_ID],
            [colsTrailers.TRAILER_MARK]: car[colsTrailers.TRAILER_MARK],
            [colsTrailers.TRAILER_MODEL]: car[colsTrailers.TRAILER_MODEL],
            [colsTrailers.TRAILER_VIN]: car[colsTrailers.TRAILER_VIN],
            [colsTrailers.TRAILER_WIDTH]: parseFloat(car[colsTrailers.TRAILER_WIDTH]),
            [colsTrailers.TRAILER_HEIGHT]: parseFloat(car[colsTrailers.TRAILER_HEIGHT]),
            [colsTrailers.TRAILER_LENGTH]: parseFloat(car[colsTrailers.TRAILER_LENGTH]),
            [colsTrailers.TRAILER_CARRYING_CAPACITY]: parseFloat(car[colsTrailers.TRAILER_CARRYING_CAPACITY]),
            [HOMELESS_COLUMNS.TRAILER_DANGER_CLASS_NAME]: car[HOMELESS_COLUMNS.TRAILER_DANGER_CLASS_NAME],
            [HOMELESS_COLUMNS.TRAILER_VEHICLE_TYPE_NAME]: car[HOMELESS_COLUMNS.TRAILER_VEHICLE_TYPE_NAME],
            [HOMELESS_COLUMNS.TRAILER_STATE_NUMBER]: car[HOMELESS_COLUMNS.TRAILER_STATE_NUMBER],
        };
        result.trailer = trailer;
    }
    return result;
};

const formatRecordForResponse = (car, isControlRole) => {
    const result = {};
    const carType = car[cols.CAR_TYPE];
    const draftCarType = car[HOMELESS_COLUMNS.DRAFT_CAR_TYPE];

    if (isControlRole) {
        result.car = {
            id: car.id,
            [cols.CAR_MARK]: car[cols.CAR_MARK],
            [cols.CAR_MODEL]: car[cols.CAR_MODEL],
            [cols.CAR_VIN]: car[cols.CAR_VIN],
            [cols.CAR_TYPE]: car[cols.CAR_TYPE],
            [cols.CAR_MADE_YEAR_AT]: car[cols.CAR_MADE_YEAR_AT],
            [HOMELESS_COLUMNS.CAR_STATE_NUMBER]: car[HOMELESS_COLUMNS.CAR_STATE_NUMBER],
            [cols.CREATED_AT]: car[cols.CREATED_AT],
            [cols.VERIFIED]: car[cols.VERIFIED],
        };

        if (carType === CAR_TYPES_MAP.TRUCK) {
            const carData = {
                [cols.CAR_LOADING_METHODS]: car[cols.CAR_LOADING_METHODS],
                [cols.CAR_CARRYING_CAPACITY]: parseFloat(car[cols.CAR_CARRYING_CAPACITY]),
                [cols.CAR_LENGTH]: parseFloat(car[cols.CAR_LENGTH]),
                [cols.CAR_HEIGHT]: parseFloat(car[cols.CAR_HEIGHT]),
                [cols.CAR_WIDTH]: parseFloat(car[cols.CAR_WIDTH]),
                [cols.CAR_DANGER_CLASS_ID]: car[cols.CAR_DANGER_CLASS_ID],
                [cols.CAR_VEHICLE_TYPE_ID]: car[cols.CAR_VEHICLE_TYPE_ID],
                [HOMELESS_COLUMNS.DANGER_CLASS_NAME]: car[HOMELESS_COLUMNS.DANGER_CLASS_NAME],
                [HOMELESS_COLUMNS.VEHICLE_TYPE_NAME]: car[HOMELESS_COLUMNS.VEHICLE_TYPE_NAME],
            };
            result.car = {
                ...result.car,
                ...carData,
            };
        }

        result.draftCar = {};
        result.files = formatCarFiles(car);
        result.draftFiles = [];

        if (car[HOMELESS_COLUMNS.DRAFT_CAR_MARK]) {
            result.draftCar = {
                [cols.CAR_MARK]: car[HOMELESS_COLUMNS.DRAFT_CAR_MARK],
                [cols.CAR_MODEL]: car[HOMELESS_COLUMNS.DRAFT_CAR_MODEL],
                [cols.CAR_VIN]: car[HOMELESS_COLUMNS.DRAFT_CAR_VIN],
                [cols.CAR_TYPE]: car[HOMELESS_COLUMNS.DRAFT_CAR_TYPE],
                [cols.CAR_MADE_YEAR_AT]: car[HOMELESS_COLUMNS.DRAFT_CAR_MADE_YEAR_AT],
                [HOMELESS_COLUMNS.CAR_STATE_NUMBER]: car[HOMELESS_COLUMNS.DRAFT_CAR_STATE_NUMBER],
                [cols.CAR_LOADING_METHODS]: car[HOMELESS_COLUMNS.DRAFT_CAR_LOADING_METHODS],
                [cols.CAR_CARRYING_CAPACITY]: car[HOMELESS_COLUMNS.DRAFT_CAR_CARRYING_CAPACITY],
                [cols.CAR_LENGTH]: car[HOMELESS_COLUMNS.DRAFT_CAR_LENGTH],
                [cols.CAR_HEIGHT]: car[HOMELESS_COLUMNS.DRAFT_CAR_HEIGHT],
                [cols.CAR_HEIGHT]: car[HOMELESS_COLUMNS.DRAFT_CAR_HEIGHT],
                [cols.CAR_WIDTH]: car[HOMELESS_COLUMNS.DRAFT_CAR_WIDTH],
                [cols.CAR_DANGER_CLASS_ID]: car[HOMELESS_COLUMNS.DRAFT_CAR_DANGER_CLASS_ID],
                [cols.CAR_VEHICLE_TYPE_ID]: car[HOMELESS_COLUMNS.DRAFT_CAR_VEHICLE_TYPE_ID],
                [HOMELESS_COLUMNS.DANGER_CLASS_NAME]: car[HOMELESS_COLUMNS.DRAFT_DANGER_CLASS_NAME],
                [HOMELESS_COLUMNS.VEHICLE_TYPE_NAME]: car[HOMELESS_COLUMNS.DRAFT_VEHICLE_TYPE_NAME],
                [HOMELESS_COLUMNS.COMMENTS]: car[colsDraftCars.COMMENTS],
            };
            result.draftFiles = formatDraftCarFiles(car);
        }

    } else {
        const tempCarType = draftCarType || carType;

        result.car = {
            id: car.id,
            [cols.CAR_MARK]: car[HOMELESS_COLUMNS.DRAFT_CAR_MARK] || car[cols.CAR_MARK],
            [cols.CAR_MODEL]: car[HOMELESS_COLUMNS.DRAFT_CAR_MODEL] || car[cols.CAR_MODEL],
            [cols.CAR_VIN]: car[HOMELESS_COLUMNS.DRAFT_CAR_VIN] || car[cols.CAR_VIN],
            [cols.CAR_TYPE]: tempCarType,
            [cols.CAR_MADE_YEAR_AT]: car[HOMELESS_COLUMNS.CAR_MADE_YEAR_AT] || car[cols.CAR_MADE_YEAR_AT],
            [HOMELESS_COLUMNS.CAR_STATE_NUMBER]: car[HOMELESS_COLUMNS.DRAFT_CAR_STATE_NUMBER] || car[HOMELESS_COLUMNS.CAR_STATE_NUMBER],
            [cols.CREATED_AT]: car[cols.CREATED_AT],
            [cols.VERIFIED]: car[cols.VERIFIED],
            [HOMELESS_COLUMNS.IS_DRAFT]: !!car[HOMELESS_COLUMNS.DRAFT_CAR_MARK],
        };

        if (tempCarType === CAR_TYPES_MAP.TRUCK) {
            const loadingMethods = car[HOMELESS_COLUMNS.DRAFT_CAR_LOADING_METHODS] || car[cols.CAR_LOADING_METHODS];
            const carryingCapacity = car[HOMELESS_COLUMNS.DRAFT_CAR_CARRYING_CAPACITY] || car[cols.CAR_CARRYING_CAPACITY];
            const length = car[HOMELESS_COLUMNS.DRAFT_CAR_LENGTH] || car[cols.CAR_LENGTH];
            const height = car[HOMELESS_COLUMNS.DRAFT_CAR_HEIGHT] || car[cols.CAR_HEIGHT];
            const width = car[HOMELESS_COLUMNS.DRAFT_CAR_WIDTH] || car[cols.CAR_WIDTH];
            const dangerClassId = car[HOMELESS_COLUMNS.DRAFT_CAR_DANGER_CLASS_ID] || car[cols.CAR_DANGER_CLASS_ID];
            const vehicleTypeId = car[HOMELESS_COLUMNS.DRAFT_CAR_VEHICLE_TYPE_ID] || car[cols.CAR_VEHICLE_TYPE_ID];
            const dangerClassName = car[HOMELESS_COLUMNS.DRAFT_DANGER_CLASS_NAME] || car[HOMELESS_COLUMNS.DANGER_CLASS_NAME];
            const vehicleTypeName = car[HOMELESS_COLUMNS.DRAFT_VEHICLE_TYPE_NAME] || car[HOMELESS_COLUMNS.VEHICLE_TYPE_NAME];

            result.car = {
                ...result.car,
                [cols.CAR_LOADING_METHODS]: loadingMethods,
                [cols.CAR_CARRYING_CAPACITY]: parseFloat(carryingCapacity),
                [cols.CAR_LENGTH]: parseFloat(length),
                [cols.CAR_HEIGHT]: parseFloat(height),
                [cols.CAR_WIDTH]: parseFloat(width),
                [cols.CAR_DANGER_CLASS_ID]: dangerClassId,
                [cols.CAR_VEHICLE_TYPE_ID]: vehicleTypeId,
                [HOMELESS_COLUMNS.DANGER_CLASS_NAME]: dangerClassName,
                [HOMELESS_COLUMNS.VEHICLE_TYPE_NAME]: vehicleTypeName,
                [HOMELESS_COLUMNS.COMMENTS]: car[colsDraftCars.COMMENTS] || undefined,
            };
        }

        result.files = formatCarFiles(car);
        let draftFiles = [];
        if (car[HOMELESS_COLUMNS.DRAFT_FILES].length) {
            draftFiles = formatDraftCarFiles(car);
            result.files = mergeFilesWithDraft(result.files, draftFiles);
        }
    }

    return result;
};

const formatCarFiles = data => {
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

const formatDraftCarFiles = data => {
    const files = data[HOMELESS_COLUMNS.DRAFT_FILES];
    return files.map(file => {
        const {f1, f2, f3, f4} = file;
        return {
            id: f1,
            [colsDraftFiles.NAME]: f2,
            [colsDraftFiles.LABELS]: f3,
            [colsDraftFiles.URL]: f4,
        };
    });
};

const formatRecordForSearch = car => {
    let result = {
        id: car.id,
        [cols.CAR_MARK]: car[cols.CAR_MARK],
        [cols.CAR_MODEL]: car[cols.CAR_MODEL],
        [cols.CAR_TYPE]: car[cols.CAR_TYPE],
        [cols.CAR_MADE_YEAR_AT]: car[cols.CAR_MADE_YEAR_AT],
        [HOMELESS_COLUMNS.CAR_STATE_NUMBER]: car[HOMELESS_COLUMNS.CAR_STATE_NUMBER],
        [cols.CREATED_AT]: car[cols.CREATED_AT],
        [HOMELESS_COLUMNS.CAR_VERIFIED]: car[cols.VERIFIED],
    };
    if (car[HOMELESS_COLUMNS.TRAILER_ID]) {
        result = {
            ...result,
            [HOMELESS_COLUMNS.TRAILER_ID]: car[HOMELESS_COLUMNS.TRAILER_ID],
            [HOMELESS_COLUMNS.TRAILER_STATE_NUMBER]: car[HOMELESS_COLUMNS.TRAILER_STATE_NUMBER],
            [HOMELESS_COLUMNS.TRAILER_VERIFIED]: car[HOMELESS_COLUMNS.TRAILER_VERIFIED],
        };
    }
    return result;
};

const formatRecordForSearchResponse = (cars) => {
    return cars.map(car => formatRecordForSearch(car));
};

const formatRecordForSearchAllResponse = (cars) => {
    return cars.map(car => formatRecordForSearch(car));
};

const formatAvailableCars = cars => cars.map(car => formatAvailableCar(car));

const formatAvailableCar = car => ({
    id: car.id,
    [cols.CAR_MARK]: car[cols.CAR_MARK],
    [cols.CAR_MODEL]: car[cols.CAR_MODEL],
    [cols.CAR_TYPE]: car[cols.CAR_TYPE],
    [cols.CAR_MADE_YEAR_AT]: car[cols.CAR_MADE_YEAR_AT],
    [HOMELESS_COLUMNS.CAR_STATE_NUMBER]: car[HOMELESS_COLUMNS.CAR_STATE_NUMBER],
});

const formatShadowCarsToSave = (arr, companyId) => arr.reduce((acc, item) => {
    const [cars, carsNumbers] = acc;
    const carId = item[HOMELESS_COLUMNS.CAR_ID];
    cars.push({
        id: carId,
        [cols.COMPANY_ID]: companyId,
        [cols.SHADOW]: true,
    });
    carsNumbers.push({
        [colsCarsNumbers.CAR_ID]: carId,
        [colsCarsNumbers.NUMBER]: item[HOMELESS_COLUMNS.CAR_STATE_NUMBER].toUpperCase(),
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

const formatRecordToUpdateFromDraft = draftCar => ({
    [cols.CAR_VIN]: draftCar[colsDraftCars.CAR_VIN],
    [cols.CAR_MARK]: draftCar[colsDraftCars.CAR_MARK],
    [cols.CAR_MODEL]: draftCar[colsDraftCars.CAR_MODEL],
    [cols.CAR_MADE_YEAR_AT]: draftCar[colsDraftCars.CAR_MADE_YEAR_AT],
    [cols.CAR_TYPE]: draftCar[colsDraftCars.CAR_TYPE],
    [cols.CAR_LOADING_METHODS]: (draftCar[colsDraftCars.CAR_LOADING_METHODS] && new SqlArray(draftCar[colsDraftCars.CAR_LOADING_METHODS])) || null,
    [cols.CAR_VEHICLE_TYPE_ID]: draftCar[colsDraftCars.CAR_VEHICLE_TYPE_ID] || null,
    [cols.CAR_DANGER_CLASS_ID]: draftCar[colsDraftCars.CAR_DANGER_CLASS_ID] || null,
    [cols.CAR_WIDTH]: draftCar[colsDraftCars.CAR_WIDTH] || null,
    [cols.CAR_HEIGHT]: draftCar[colsDraftCars.CAR_HEIGHT] || null,
    [cols.CAR_LENGTH]: draftCar[colsDraftCars.CAR_LENGTH] || null,
    [cols.CAR_CARRYING_CAPACITY]: draftCar[colsDraftCars.CAR_CARRYING_CAPACITY] || null,
});

module.exports = {
    formatCarToSave,
    formatCarToEdit,
    formatRecordForList,
    formatRecordForResponse,
    formatAvailableCars,
    formatRecordForListAvailable,
    formatShadowCarsToSave,
    formatRecordAsNotVerified,
    formatRecordAsVerified,
    formatRecordAsNotShadow,
    formatRecordToUpdateFromDraft,
    formatRecordForSearchAllResponse,
    formatRecordForSearchResponse,
};
