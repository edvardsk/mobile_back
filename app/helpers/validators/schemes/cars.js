// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { CAR_TYPES, CAR_TYPES_MAP } = require('constants/cars');
const { LOADING_METHODS } = require('constants/cargos');
const { STRING_BOOLEANS_MAP } = require('constants/index');
const { DOCUMENTS } = require('constants/files');

// patterns
const { POSTGRES_MAX_STRING_LENGTH, SIZES_VALIDATION_PATTERN } = require('./patterns');

// helpers
const { fileFormat } = require('./helpers');

const colsCars = SQL_TABLES.CARS.COLUMNS;
const colsTrailers = SQL_TABLES.TRAILERS.COLUMNS;

const CAR_PROPS = {
    [colsCars.CAR_MARK]: {
        type: 'string',
        minLength: 1,
        maxLength: POSTGRES_MAX_STRING_LENGTH,
    },
    [colsCars.CAR_MODEL]: {
        type: 'string',
        minLength: 1,
        maxLength: POSTGRES_MAX_STRING_LENGTH,
    },
    [HOMELESS_COLUMNS.CAR_STATE_NUMBER]: {
        type: 'string',
        minLength: 1,
        maxLength: POSTGRES_MAX_STRING_LENGTH,
    },
    [colsCars.CAR_MADE_YEAR_AT]: {
        type: 'string',
        format: 'year',
        formatMaximum: 'current',
        formatMinimum: '1900',
    },
    [colsCars.CAR_TYPE]: {
        type: 'string',
        enum: CAR_TYPES,
    },
    [colsCars.CAR_LOADING_METHODS]: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
            enum: LOADING_METHODS,
        },
    },
    [colsCars.CAR_VEHICLE_TYPE_ID]: {
        type: 'string',
        format: 'uuid',
    },
    [colsCars.CAR_WIDTH]: {
        type: 'string',
        pattern: SIZES_VALIDATION_PATTERN,
    },
    [colsCars.CAR_HEIGHT]: {
        type: 'string',
        pattern: SIZES_VALIDATION_PATTERN,
    },
    [colsCars.CAR_LENGTH]: {
        type: 'string',
        pattern: SIZES_VALIDATION_PATTERN,
    },
    [colsCars.CAR_CARRYING_CAPACITY]: {
        type: 'string',
        pattern: SIZES_VALIDATION_PATTERN,
    },
    [colsCars.CAR_DANGER_CLASS_ID]: {
        type: 'string',
        format: 'uuid',
    },
    [HOMELESS_COLUMNS.CAR_DANGER_CLASS]: fileFormat,
    [HOMELESS_COLUMNS.CAR_VEHICLE_REGISTRATION_PASSPORT]: fileFormat,
    [HOMELESS_COLUMNS.CAR_VEHICLE_TECHNICAL_INSPECTION]: fileFormat,
};

const TRAILER_PROPS = {
    [colsTrailers.TRAILER_MARK]: {
        type: 'string',
        minLength: 1,
        maxLength: POSTGRES_MAX_STRING_LENGTH,
    },
    [colsTrailers.TRAILER_MODEL]: {
        type: 'string',
        minLength: 1,
        maxLength: POSTGRES_MAX_STRING_LENGTH,
    },
    [HOMELESS_COLUMNS.TRAILER_STATE_NUMBER]: {
        type: 'string',
        minLength: 1,
        maxLength: POSTGRES_MAX_STRING_LENGTH,
    },
    [colsTrailers.TRAILER_MADE_YEAR_AT]: {
        type: 'string',
        format: 'year',
        formatMaximum: 'current',
        formatMinimum: '1900',
    },
    [colsTrailers.TRAILER_LOADING_METHODS]: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
            enum: LOADING_METHODS,
        },
    },
    [colsTrailers.TRAILER_VEHICLE_TYPE_ID]: {
        type: 'string',
        format: 'uuid',
    },
    [colsTrailers.TRAILER_CARRYING_CAPACITY]: {
        type: 'string',
        pattern: SIZES_VALIDATION_PATTERN,
    },
    [colsTrailers.TRAILER_HEIGHT]: {
        type: 'string',
        pattern: SIZES_VALIDATION_PATTERN,
    },
    [colsTrailers.TRAILER_LENGTH]: {
        type: 'string',
        pattern: SIZES_VALIDATION_PATTERN,
    },
    [colsTrailers.TRAILER_WIDTH]: {
        type: 'string',
        pattern: SIZES_VALIDATION_PATTERN,
    },
    [colsTrailers.TRAILER_DANGER_CLASS_ID]: {
        type: 'string',
        format: 'uuid',
    },
    [HOMELESS_COLUMNS.TRAILER_DANGER_CLASS]: fileFormat,
    [HOMELESS_COLUMNS.TRAILER_VEHICLE_REGISTRATION_PASSPORT]: fileFormat,
    [HOMELESS_COLUMNS.TRAILER_VEHICLE_TECHNICAL_INSPECTION]: fileFormat,
};

const createCarTrailerCondition = {
    oneOf: [
        {
            properties: {
                [HOMELESS_COLUMNS.IS_CAR]: {
                    const: STRING_BOOLEANS_MAP.TRUE,
                },
                [HOMELESS_COLUMNS.IS_TRAILER]: {
                    const: STRING_BOOLEANS_MAP.FALSE,
                },
            },
            prohibited: [
                ...Object.keys(TRAILER_PROPS),
            ],
        },
        {
            properties: {
                [HOMELESS_COLUMNS.IS_CAR]: {
                    const: STRING_BOOLEANS_MAP.FALSE,
                },
                [HOMELESS_COLUMNS.IS_TRAILER]: {
                    const: STRING_BOOLEANS_MAP.TRUE,
                },
            },
            prohibited: [
                ...Object.keys(CAR_PROPS),
            ],
        },
        {
            properties: {
                [HOMELESS_COLUMNS.IS_CAR]: {
                    const: STRING_BOOLEANS_MAP.TRUE,
                },
                [HOMELESS_COLUMNS.IS_TRAILER]: {
                    const: STRING_BOOLEANS_MAP.TRUE,
                },
            }
        },
    ],
    required:[
        HOMELESS_COLUMNS.IS_CAR,
        HOMELESS_COLUMNS.IS_TRAILER,
    ],
};

const modifyCarTrailerIdentityKeys = {
    properties: {
        [HOMELESS_COLUMNS.IS_CAR]: {
            parse_string_boolean: {},
        },
        [HOMELESS_COLUMNS.IS_TRAILER]: {
            parse_string_boolean: {},
        },
    },
};

const modifyCreateCarArrays = {
    if: {
        properties: {
            [HOMELESS_COLUMNS.IS_CAR]: {
                const: true,
            },
            [colsCars.CAR_TYPE]: {
                const: CAR_TYPES_MAP.TRUCK,
            }
        },
    },
    then: {
        properties: {
            [colsCars.CAR_LOADING_METHODS]: {
                parse_string_to_json: {},
            },
        },
    },
};

const modifyCreateTrailerArrays = {
    if: {
        properties: {
            [HOMELESS_COLUMNS.IS_TRAILER]: {
                const: true,
            },
        },
    },
    then: {
        properties: {
            [colsTrailers.TRAILER_LOADING_METHODS]: {
                parse_string_to_json: {},
            },
        },
    },
};

const modifyEditCarArrays = {
    if: {
        properties: {
            [colsCars.CAR_TYPE]: {
                const: CAR_TYPES_MAP.TRUCK,
            }
        },
    },
    then: {
        properties: {
            [colsCars.CAR_LOADING_METHODS]: {
                parse_string_to_json: {},
            },
        },
    },
};

const modifyCreateCarFloats = {
    if: {
        properties: {
            [HOMELESS_COLUMNS.IS_CAR]: {
                const: true,
            },
            [colsCars.CAR_TYPE]: {
                const: CAR_TYPES_MAP.TRUCK,
            }
        },
    },
    then: {
        properties: {
            [colsCars.CAR_WIDTH]: {
                parse_string_to_float: {},
            },
            [colsCars.CAR_HEIGHT]: {
                parse_string_to_float: {},
            },
            [colsCars.CAR_LENGTH]: {
                parse_string_to_float: {},
            },
            [colsCars.CAR_CARRYING_CAPACITY]: {
                parse_string_to_float: {},
            },
        },
    },
};

const modifyCreateTrailerFloats = {
    if: {
        properties: {
            [HOMELESS_COLUMNS.IS_TRAILER]: {
                const: true,
            },
        },
    },
    then: {
        properties: {
            [colsTrailers.TRAILER_WIDTH]: {
                parse_string_to_float: {},
            },
            [colsTrailers.TRAILER_HEIGHT]: {
                parse_string_to_float: {},
            },
            [colsTrailers.TRAILER_LENGTH]: {
                parse_string_to_float: {},
            },
            [colsTrailers.TRAILER_CARRYING_CAPACITY]: {
                parse_string_to_float: {},
            },
        },
    },
};

const modifyEditCarTruckFloats = {
    if: {
        properties: {
            [colsCars.CAR_TYPE]: {
                const: CAR_TYPES_MAP.TRUCK,
            }
        },
    },
    then: {
        properties: {
            [colsCars.CAR_WIDTH]: {
                parse_string_to_float: {},
            },
            [colsCars.CAR_HEIGHT]: {
                parse_string_to_float: {},
            },
            [colsCars.CAR_LENGTH]: {
                parse_string_to_float: {},
            },
            [colsCars.CAR_CARRYING_CAPACITY]: {
                parse_string_to_float: {},
            },
        },
    },
};

const createCarCommon = {
    properties: {
        ...CAR_PROPS,
        ...TRAILER_PROPS,
        [HOMELESS_COLUMNS.IS_CAR]: {
            type: 'boolean',
        },
        [HOMELESS_COLUMNS.IS_TRAILER]: {
            type: 'boolean',
        },
    },
    if: {
        properties: {
            [HOMELESS_COLUMNS.IS_CAR]: {
                const: true,
            },
        },
    },
    then: {
        required: [
            colsCars.CAR_MARK,
            colsCars.CAR_MODEL,
            colsCars.CAR_TYPE,
            HOMELESS_COLUMNS.CAR_STATE_NUMBER,
            colsCars.CAR_MADE_YEAR_AT,
        ],
    },
    additionalProperties: false,
};

const createTrailerCommon = {
    properties: {
        ...CAR_PROPS,
        ...TRAILER_PROPS,
        [HOMELESS_COLUMNS.IS_CAR]: {
            type: 'boolean',
        },
        [HOMELESS_COLUMNS.IS_TRAILER]: {
            type: 'boolean',
        },
    },
    if: {
        properties: {
            [HOMELESS_COLUMNS.IS_TRAILER]: {
                const: true,
            },
        },
    },
    then: {
        required: [
            colsTrailers.TRAILER_MARK,
            colsTrailers.TRAILER_MODEL,
            colsTrailers.TRAILER_MADE_YEAR_AT,
            HOMELESS_COLUMNS.TRAILER_STATE_NUMBER,
            colsTrailers.TRAILER_LOADING_METHODS,
            colsTrailers.TRAILER_VEHICLE_TYPE_ID,
            colsTrailers.TRAILER_CARRYING_CAPACITY,
            colsTrailers.TRAILER_HEIGHT,
            colsTrailers.TRAILER_LENGTH,
            colsTrailers.TRAILER_WIDTH,
            colsTrailers.TRAILER_DANGER_CLASS_ID,
        ],
    },
    additionalProperties: false,
};

const editCarCommon = {
    properties: {
        ...CAR_PROPS,
    },
    required:[
        colsCars.CAR_MARK,
        colsCars.CAR_MODEL,
        colsCars.CAR_TYPE,
        HOMELESS_COLUMNS.CAR_STATE_NUMBER,
        colsCars.CAR_MADE_YEAR_AT,
    ],
    additionalProperties: false,
};

const editTrailer = {
    properties: {
        ...TRAILER_PROPS,
    },
    required:[
        colsTrailers.TRAILER_MARK,
        colsTrailers.TRAILER_MODEL,
        colsTrailers.TRAILER_MADE_YEAR_AT,
        HOMELESS_COLUMNS.TRAILER_STATE_NUMBER,
        colsTrailers.TRAILER_LOADING_METHODS,
        colsTrailers.TRAILER_VEHICLE_TYPE_ID,
        colsTrailers.TRAILER_CARRYING_CAPACITY,
        colsTrailers.TRAILER_HEIGHT,
        colsTrailers.TRAILER_LENGTH,
        colsTrailers.TRAILER_WIDTH,
        colsTrailers.TRAILER_DANGER_CLASS_ID,
    ],
    additionalProperties: false,
};

const editTrailerAsyncFunc = ({ trailerId }) => ({
    $async: true,
    properties: {
        [HOMELESS_COLUMNS.TRAILER_STATE_NUMBER]: {
            trailer_state_number_exists: {
                trailerId,
            },
        }
    },
});

const editTrailerFiles = {
    properties: {
        [DOCUMENTS.VEHICLE_REGISTRATION_PASSPORT]: fileFormat,
        [DOCUMENTS.VEHICLE_TECHNICAL_INSPECTION]: fileFormat,
        [DOCUMENTS.DANGER_CLASS]: fileFormat,
    },
    additionalProperties: false,
};

const editTrailerFilesCheckDangerClassAsyncFunc = ({ trailerId }) => ({
    $async: true,
    properties: {
        [colsTrailers.TRAILER_DANGER_CLASS_ID]: {
            new_trailer_danger_class_without_or_extra_file: {
                trailerId,
            },
        },
    },
});

const createCarCommonAsync = {
    $async: true,
    if: {
        properties: {
            [HOMELESS_COLUMNS.IS_CAR]: {
                const: true,
            },
        },
    },
    then: {
        properties: {
            [HOMELESS_COLUMNS.CAR_STATE_NUMBER]: {
                car_state_number_exists: {},
            }
        },
    },
    additionalProperties: true,
};

const createTrailerCommonAsync = {
    $async: true,
    if: {
        properties: {
            [HOMELESS_COLUMNS.IS_TRAILER]: {
                const: true,
            },
        },
    },
    then: {
        properties: {
            [HOMELESS_COLUMNS.TRAILER_STATE_NUMBER]: {
                trailer_state_number_exists: {},
            },
            [colsCars.TRAILER_DANGER_CLASS_ID]: {
                danger_class_not_exist: {},
            },
            [colsCars.TRAILER_VEHICLE_TYPE_ID]: {
                vehicle_type_not_exist: {},
            },
        },
    },
};

const createCarCommonFiles = {
    $async: true,
    if: {
        properties: {
            [HOMELESS_COLUMNS.IS_CAR]: {
                const: true,
            },
        },
    },
    then: {
        properties: {
            [HOMELESS_COLUMNS.CAR_VEHICLE_REGISTRATION_PASSPORT]: fileFormat,
            [HOMELESS_COLUMNS.CAR_VEHICLE_TECHNICAL_INSPECTION]: fileFormat,
        },
        required: [
            HOMELESS_COLUMNS.CAR_VEHICLE_REGISTRATION_PASSPORT,
            HOMELESS_COLUMNS.CAR_VEHICLE_TECHNICAL_INSPECTION,
        ]
    },
};

const createTrailerCommonFiles = {
    $async: true,
    if: {
        properties: {
            [HOMELESS_COLUMNS.IS_TRAILER]: {
                const: true,
            },
        },
    },
    then: {
        required: [
            HOMELESS_COLUMNS.TRAILER_VEHICLE_REGISTRATION_PASSPORT,
            HOMELESS_COLUMNS.TRAILER_VEHICLE_TECHNICAL_INSPECTION,
        ]
    },
};

const editCarCommonFiles = {
    properties: {
        [DOCUMENTS.VEHICLE_REGISTRATION_PASSPORT]: fileFormat,
        [DOCUMENTS.VEHICLE_TECHNICAL_INSPECTION]: fileFormat,
        [DOCUMENTS.DANGER_CLASS]: fileFormat,
    },
    additionalProperties: false,
};

const editCarCommonAsyncFunc = ({ carId }) => ({
    $async: true,
    properties: {
        [HOMELESS_COLUMNS.CAR_STATE_NUMBER]: {
            car_state_number_exists: {
                carId,
            },
        }
    },
});

const createCarTruck = {
    if: {
        properties: {
            [HOMELESS_COLUMNS.IS_CAR]: {
                const: true
            },
            [colsCars.CAR_TYPE]: {
                const: CAR_TYPES_MAP.TRUCK,
            }
        },
    },
    then: {
        required: [
            colsCars.CAR_DANGER_CLASS_ID,
            colsCars.CAR_LOADING_METHODS,
            colsCars.CAR_VEHICLE_TYPE_ID,
            colsCars.CAR_WIDTH,
            colsCars.CAR_HEIGHT,
            colsCars.CAR_LENGTH,
            colsCars.CAR_CARRYING_CAPACITY,
        ],
    },
};

const editCarTruck = {
    properties: {
        ...CAR_PROPS,
    },
    if: {
        properties: {
            [colsCars.CAR_TYPE]: {
                const: CAR_TYPES_MAP.TRUCK,
            }
        },
    },
    then: {
        required: [
            colsCars.CAR_DANGER_CLASS_ID,
            colsCars.CAR_LOADING_METHODS,
            colsCars.CAR_VEHICLE_TYPE_ID,
            colsCars.CAR_WIDTH,
            colsCars.CAR_HEIGHT,
            colsCars.CAR_LENGTH,
            colsCars.CAR_CARRYING_CAPACITY,
        ],
    },
};

const createCarTruckAsync = {
    $async: true,
    if: {
        properties: {
            [HOMELESS_COLUMNS.IS_CAR]: {
                const: true,
            },
            [colsCars.CAR_TYPE]: {
                const: CAR_TYPES_MAP.TRUCK,
            },
        },
    },
    then: {
        properties: {
            [colsCars.CAR_DANGER_CLASS_ID]: {
                danger_class_not_exist: {},
            },
            [colsCars.CAR_VEHICLE_TYPE_ID]: {
                vehicle_type_not_exist: {},
            },
        },
    },
};

const editCarTruckAsync = {
    $async: true,
    properties: {
        ...CAR_PROPS,
    },
    if: {
        properties: {
            [colsCars.CAR_TYPE]: {
                const: CAR_TYPES_MAP.TRUCK,
            }
        },
    },
    then: {
        properties: {
            [colsCars.CAR_DANGER_CLASS_ID]: {
                danger_class_not_exist: {},
            },
            [colsCars.CAR_VEHICLE_TYPE_ID]: {
                vehicle_type_not_exist: {},
            },
        },
    },
};

const createCarTruckFiles = {
    anyOf: [
        {
            properties: {
                [HOMELESS_COLUMNS.IS_CAR]: {
                    const: true,
                },
                [colsCars.CAR_TYPE]: {
                    const: CAR_TYPES_MAP.TRUCK,
                },
            },
            required: [
                colsCars.CAR_DANGER_CLASS_ID,
                HOMELESS_COLUMNS.CAR_DANGER_CLASS,
            ],
        },
        {
            properties: {
                [HOMELESS_COLUMNS.IS_CAR]: {
                    const: true,
                },
                [colsCars.CAR_TYPE]: {
                    const: CAR_TYPES_MAP.TRUCK,
                },
            },
            required: [
                colsCars.CAR_DANGER_CLASS_ID,
            ],
        },
        {
            properties: {
                [HOMELESS_COLUMNS.IS_CAR]: {
                    const: true,
                },
                [colsCars.CAR_TYPE]: {
                    const: CAR_TYPES_MAP.QUAD,
                },
            },
            prohibited: [
                HOMELESS_COLUMNS.CAR_DANGER_CLASS
            ],
        },
        {
            properties: {
                [HOMELESS_COLUMNS.IS_CAR]: {
                    const: false,
                },
            },
        },
    ],
};

const editCarTruckFiles = {
    properties: {
        ...CAR_PROPS,
        [DOCUMENTS.DANGER_CLASS]: fileFormat,
        [DOCUMENTS.VEHICLE_REGISTRATION_PASSPORT]: fileFormat,
        [DOCUMENTS.VEHICLE_TECHNICAL_INSPECTION]: fileFormat,
    },
    if: {
        properties: {
            [colsCars.CAR_TYPE]: {
                const: CAR_TYPES_MAP.QUAD,
            }
        },
    },
    then: {
        prohibited: [
            DOCUMENTS.DANGER_CLASS,
        ],
    },
};

const createCarTruckFilesCheckDangerClassAsync  = {
    $async: true,
    if: {
        properties: {
            [colsCars.CAR_TYPE]: {
                const: CAR_TYPES_MAP.TRUCK,
            }
        },
    },
    then: {
        properties: {
            [colsCars.CAR_DANGER_CLASS_ID]: {
                car_danger_class_without_file_or_extra_file: {},
            },
        },
    },
};

const createTrailerFilesCheckDangerClassAsync  = {
    $async: true,
    if: {
        properties: {
            [HOMELESS_COLUMNS.IS_TRAILER]: {
                const: true,
            }
        },
    },
    then: {
        properties: {
            [colsTrailers.TRAILER_DANGER_CLASS_ID]: {
                trailer_danger_class_without_file_or_extra_file: {},
            },
        },
    },
};

const editCarTruckFilesCheckDangerClassAsyncFunc = ({ carId }) => ({
    $async: true,
    if: {
        properties: {
            [colsCars.CAR_TYPE]: {
                const: CAR_TYPES_MAP.TRUCK,
            }
        },
    },
    then: {
        properties: {
            [colsCars.CAR_DANGER_CLASS_ID]: {
                new_car_danger_class_without_or_extra_file: {
                    carId,
                },
            },
        },
    },
});

const requiredExistingCarInCompanyAsyncFunc = ({ companyId }) => ({
    $async: true,
    properties: {
        carId: {
            car_in_company_not_exists: {
                companyId,
            },
        },
    },
});

const requiredCarId = {
    properties: {
        carId: {
            type: 'string',
            format: 'uuid',
        },
    },
    required: [
        'carId',
    ]
};

const requiredExistingCarAsync = {
    $async: true,
    properties: {
        carId: {
            car_not_exists: {},
        },
    },
};

module.exports = {
    modifyCarTrailerIdentityKeys,
    modifyCreateCarArrays,
    modifyCreateTrailerArrays,
    modifyEditCarArrays,
    modifyCreateCarFloats,
    modifyCreateTrailerFloats,
    createCarTrailerCondition,
    createCarCommon,
    createCarCommonAsync,
    createCarCommonFiles,

    createTrailerCommon,
    createTrailerCommonAsync,
    createTrailerCommonFiles,

    editCarCommon,
    editCarCommonAsyncFunc,
    editCarCommonFiles,

    editTrailer,
    editTrailerAsyncFunc,
    editTrailerFiles,
    editTrailerFilesCheckDangerClassAsyncFunc,

    createCarTruck,
    createCarTruckAsync,
    createCarTruckFiles,
    editCarTruck,
    editCarTruckAsync,
    editCarTruckFiles,
    createCarTruckFilesCheckDangerClassAsync,
    createTrailerFilesCheckDangerClassAsync,
    editCarTruckFilesCheckDangerClassAsyncFunc,
    modifyEditCarTruckFloats,
    requiredExistingCarInCompanyAsyncFunc,
    requiredCarId,
    requiredExistingCarAsync,
};
