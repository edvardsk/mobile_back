// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { CAR_TYPES, CAR_TYPES_MAP } = require('constants/cars');
const { LOADING_METHODS } = require('constants/cargos');
const { STRING_BOOLEANS, STRING_BOOLEANS_MAP } = require('constants/index');
const { DOCUMENTS } = require('constants/files');

// patterns
const { POSTGRES_MAX_STRING_LENGTH, SIZES_VALIDATION_PATTERN } = require('./patterns');

// helpers
const { fileFormat } = require('./helpers');

const colsCars = SQL_TABLES.CARS.COLUMNS;

const CAR_PROPS = {
    [HOMELESS_COLUMNS.IS_CAR]: {
        type: 'string',
        enum: STRING_BOOLEANS,
    },
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
    [colsCars.CAR_WEIGHT]: {
        type: 'string',
        pattern: SIZES_VALIDATION_PATTERN,
    },
    [colsCars.CAR_DANGER_CLASS_ID]: {
        type: 'string',
        format: 'uuid',
    },
};

const modifyCarArrays = {
    if: {
        properties: {
            [HOMELESS_COLUMNS.IS_CAR]: {
                const: STRING_BOOLEANS_MAP.TRUE,
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

const modifyCarFloats = {
    if: {
        properties: {
            [HOMELESS_COLUMNS.IS_CAR]: {
                const: STRING_BOOLEANS_MAP.TRUE,
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
            [colsCars.CAR_WEIGHT]: {
                parse_string_to_float: {},
            },
        },
    },
};

const createCarCommon = {
    properties: {
        ...CAR_PROPS,
    },
    if: {
        properties: {
            [HOMELESS_COLUMNS.IS_CAR]: {
                const: STRING_BOOLEANS_MAP.TRUE,
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
    required:[
        HOMELESS_COLUMNS.IS_CAR,
    ],
    additionalProperties: false,
};

const createCarCommonAsync = {
    $async: true,
    properties: {
        [HOMELESS_COLUMNS.CAR_STATE_NUMBER]: {
            car_state_number_exists: {},
        }
    },
    additionalProperties: true,
};

const createCarTruck = {
    properties: {
        ...CAR_PROPS,
    },
    if: {
        properties: {
            [HOMELESS_COLUMNS.IS_CAR]: {
                const: STRING_BOOLEANS_MAP.TRUE,
            },
            [colsCars.CAR_TYPE]: {
                const: CAR_TYPES_MAP.TRUCK,
            }
        },
    },
    then: {
        required: [
            colsCars.CAR_LOADING_METHODS,
            colsCars.CAR_VEHICLE_TYPE_ID,
            colsCars.CAR_WIDTH,
            colsCars.CAR_HEIGHT,
            colsCars.CAR_LENGTH,
            colsCars.CAR_WEIGHT,
        ],
    },
};

const createCarTruckAsync = {
    $async: true,
    properties: {
        ...CAR_PROPS,
    },
    if: {
        properties: {
            [HOMELESS_COLUMNS.IS_CAR]: {
                const: STRING_BOOLEANS_MAP.TRUE,
            },
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
    additionalProperties: true,
};

const createCarTruckFiles = {
    properties: {
        ...CAR_PROPS,
        [DOCUMENTS.DANGER_CLASS]: fileFormat,
        [DOCUMENTS.VEHICLE_REGISTRATION_PASSPORT]: fileFormat,
        [DOCUMENTS.VEHICLE_TECHNICAL_INSPECTION]: fileFormat,
    },
    anyOf: [
        {
            properties: {
                [HOMELESS_COLUMNS.IS_CAR]: {
                    const: STRING_BOOLEANS_MAP.TRUE,
                },
                [colsCars.CAR_TYPE]: {
                    const: CAR_TYPES_MAP.TRUCK,
                },
            },
            required: [
                colsCars.CAR_DANGER_CLASS_ID,
                DOCUMENTS.DANGER_CLASS,
            ],
        },
        {
            properties: {
                [HOMELESS_COLUMNS.IS_CAR]: {
                    const: STRING_BOOLEANS_MAP.TRUE,
                },
                [colsCars.CAR_TYPE]: {
                    const: CAR_TYPES_MAP.TRUCK,
                },
            },
            prohibited: [
                colsCars.CAR_DANGER_CLASS_ID,
                DOCUMENTS.DANGER_CLASS,
            ],
        },
        {
            properties: {
                [HOMELESS_COLUMNS.IS_CAR]: {
                    const: STRING_BOOLEANS_MAP.TRUE,
                },
                [colsCars.CAR_TYPE]: {
                    const: CAR_TYPES_MAP.QUAD,
                },
            },
            prohibited: [
                colsCars.CAR_DANGER_CLASS_ID,
                DOCUMENTS.DANGER_CLASS,
                DOCUMENTS.VEHICLE_REGISTRATION_PASSPORT,
            ],
        },
    ],
    additionalProperties: false,
};

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
    $async: true,
    properties: {
        carId: {
            type: 'string',
            format: 'uuid',
        },
    },
};

module.exports = {
    modifyCarArrays,
    modifyCarFloats,
    createCarCommon,
    createCarCommonAsync,
    createCarTruck,
    createCarTruckAsync,
    createCarTruckFiles,
    requiredExistingCarInCompanyAsyncFunc,
    requiredCarId,
};
