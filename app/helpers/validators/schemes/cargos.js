// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const {
    LOADING_METHODS_MAP,
    LOADING_TYPES_MAP,
    GUARANTEES_MAP,
} = require('constants/cargos');

// helpers
const { coordinatesFormat, coordinatesFormatWithoutName } = require('./helpers');
const {
    DIGITS_VALIDATION_PATTERN,
    MAX_SAFE_INTEGER_POSTGRES,
} = require('./patterns');

// exported schemes
const colsCargos = SQL_TABLES.CARGOS.COLUMNS;
const colsCargoPrices = SQL_TABLES.CARGO_PRICES.COLUMNS;

const createOrEditCargo = {
    properties: {
        [HOMELESS_COLUMNS.PRICES]: {
            type: 'array',
            minItems: 1,
            uniqueItems: true,
            items: {
                properties: {
                    [colsCargoPrices.CURRENCY_ID]: {
                        type: 'string',
                        format: 'uuid',
                    },
                    [colsCargoPrices.PRICE]: {
                        type: 'number',
                        format: 'price',
                        exclusiveMinimum: 0,
                    },
                },
                required: [
                    colsCargoPrices.CURRENCY_ID,
                    colsCargoPrices.PRICE,
                ],
                additionalProperties: false,
            },
        },
        [colsCargos.COUNT]: {
            type: 'number',
            minimum: 1,
            maximum: MAX_SAFE_INTEGER_POSTGRES,
        },
        [colsCargos.UPLOADING_DATE_FROM]: {
            type: 'string',
            format: 'date-time',
        },
        [colsCargos.UPLOADING_DATE_TO]: {
            type: 'string',
            format: 'date-time',
            formatMinimum: {
                '$data': `1/${colsCargos.UPLOADING_DATE_FROM}`,
            },
        },
        [colsCargos.DOWNLOADING_DATE_FROM]: {
            type: 'string',
            format: 'date-time',
            formatMinimum: {
                '$data': `1/${colsCargos.UPLOADING_DATE_FROM}`,
            },
        },
        [colsCargos.DOWNLOADING_DATE_TO]: {
            type: 'string',
            format: 'date-time',
            downloading_date_to_minimum: {},
        },
        [colsCargos.GROSS_WEIGHT]: {
            type: 'number',
            format: 'size',
            exclusiveMinimum: 0,
            exclusiveMaximum: 1000,
        },
        [colsCargos.WIDTH]: {
            type: 'number',
            format: 'size',
            exclusiveMinimum: 0,
            exclusiveMaximum: 1000,
        },
        [colsCargos.HEIGHT]: {
            type: 'number',
            format: 'size',
            exclusiveMinimum: 0,
            exclusiveMaximum: 1000,
        },
        [colsCargos.LENGTH]: {
            type: 'number',
            format: 'size',
            exclusiveMinimum: 0,
            exclusiveMaximum: 1000,
        },
        [colsCargos.LOADING_METHODS]: {
            type: 'array',
            minItems: 1,
            uniqueItems: true,
            items: {
                enum: [LOADING_METHODS_MAP.UP, LOADING_METHODS_MAP.BACK, LOADING_METHODS_MAP.SIDE],

            },
        },
        [colsCargos.LOADING_TYPE]: {
            type: 'string',
            enum: [LOADING_TYPES_MAP.FTL, LOADING_TYPES_MAP.LTL],
        },
        [colsCargos.GUARANTEES]: {
            type: 'array',
            minItems: 1,
            uniqueItems: true,
            items: {
                enum: [GUARANTEES_MAP.CMR, GUARANTEES_MAP.TIR],
            },
        },
        [colsCargos.DANGER_CLASS_ID]: {
            type: 'string',
            format: 'uuid',
        },
        [colsCargos.VEHICLE_TYPE_ID]: {
            type: 'string',
            format: 'uuid',
        },
        [colsCargos.PACKING_DESCRIPTION]: {
            type: 'string',
        },
        [colsCargos.DESCRIPTION]: {
            type: 'string',
        },
        [colsCargos.TNVED_CODE_ID]: {
            type: 'string',
            format: 'uuid',
        },
        [HOMELESS_COLUMNS.UPLOADING_POINTS]: {
            type: 'array',
            minItems: 1,
            uniqueItems: true,
            items: coordinatesFormat,
        },
        [HOMELESS_COLUMNS.DOWNLOADING_POINTS]: {
            type: 'array',
            minItems: 1,
            uniqueItems: true,
            items: coordinatesFormat
        },
    },
    required:[
        HOMELESS_COLUMNS.PRICES,
        colsCargos.COUNT,
        colsCargos.UPLOADING_DATE_FROM,
        colsCargos.DOWNLOADING_DATE_TO,
        colsCargos.GROSS_WEIGHT,
        colsCargos.WIDTH,
        colsCargos.HEIGHT,
        colsCargos.LENGTH,
        colsCargos.LOADING_METHODS,
        colsCargos.LOADING_TYPE,
        colsCargos.GUARANTEES,
        colsCargos.VEHICLE_TYPE_ID,
        colsCargos.DANGER_CLASS_ID,
        colsCargos.TNVED_CODE_ID,
        HOMELESS_COLUMNS.UPLOADING_POINTS,
        HOMELESS_COLUMNS.DOWNLOADING_POINTS,
    ],
    additionalProperties: false,
};

const createOrEditCargoAsync = {
    $async: true,
    properties: {
        [colsCargos.DANGER_CLASS_ID]: {
            danger_class_not_exist: {},
        },
        [colsCargos.VEHICLE_TYPE_ID]: {
            vehicle_type_not_exist: {},
        },
        [colsCargos.TNVED_CODE_ID]: {
            tnved_code_not_exist: {},
        },
        [HOMELESS_COLUMNS.PRICES]: {
            currency_in_prices_not_exist: {},
        },
    },
    additionalProperties: true,
};

const requiredCargoId = {
    properties: {
        cargoId: {
            type: 'string',
            format: 'uuid',
        },
    },
    required: [
        'cargoId',
    ]
};

const requiredExistingFreeCargoAsync = {
    $async: true,
    properties: {
        cargoId: {
            free_cargo_not_exist: {},
        },
    },
    required: [
        'cargoId',
    ]
};

const requiredExistingCargoInCompanyAsyncFunc = ({ companyId }) => ({
    $async: true,
    properties: {
        cargoId: {
            cargo_in_company_not_exist: {
                companyId,
            },
        },
    },
});

const requiredExistingCargoAsync = {
    $async: true,
    properties: {
        cargoId: {
            cargo_not_exist: {},
        },
    },
};

const searchCargoQuery = {
    properties: {
        [HOMELESS_COLUMNS.ZOOM]: {
            type: 'string',
            pattern: DIGITS_VALIDATION_PATTERN,
        },
        [HOMELESS_COLUMNS.CLUSTER_SW]: {
            type: 'string',
            format: 'json',
        },
        [HOMELESS_COLUMNS.CLUSTER_NE]: {
            type: 'string',
            format: 'json',
        },
        [HOMELESS_COLUMNS.LANGUAGE_CODE]: {
            type: 'string',
            minLength: 2,
            maxLength: 10,
        },
        [HOMELESS_COLUMNS.UPLOADING_POINT]: {
            type: 'string',
            format: 'json',
        },
        [HOMELESS_COLUMNS.DOWNLOADING_POINT]: {
            type: 'string',
            format: 'json',
        },
        [HOMELESS_COLUMNS.UPLOADING_DATE]: {
            type: 'string',
            format: 'date-time',
        },
        [HOMELESS_COLUMNS.DOWNLOADING_DATE]: {
            type: 'string',
            format: 'date-time',
            formatMinimum: {
                '$data': `1/${HOMELESS_COLUMNS.UPLOADING_DATE}`,
            },
        },
        [colsCargos.GROSS_WEIGHT]: {
            type: 'string',
        },
        [colsCargos.WIDTH]: {
            type: 'string',
        },
        [colsCargos.HEIGHT]: {
            type: 'string',
        },
        [colsCargos.LENGTH]: {
            type: 'string',
        },
        [colsCargos.LOADING_METHODS]: {
            type: 'string',
        },
        [colsCargos.LOADING_TYPE]: {
            type: 'string',
            enum: [LOADING_TYPES_MAP.FTL, LOADING_TYPES_MAP.LTL],
        },
        [colsCargos.GUARANTEES]: {
            type: 'string',
        },
        [colsCargos.DANGER_CLASS_ID]: {
            type: 'string',
            format: 'uuid',
        },
        [colsCargos.VEHICLE_TYPE_ID]: {
            type: 'string',
            format: 'uuid',
        },
        [HOMELESS_COLUMNS.SEARCH_ITEMS]: {
            type: 'string',
        },
        [HOMELESS_COLUMNS.SEARCH_RADIUS]: {
            type: 'string',
            pattern: DIGITS_VALIDATION_PATTERN,
        },
    },
    required: [
        HOMELESS_COLUMNS.UPLOADING_POINT,
        HOMELESS_COLUMNS.SEARCH_RADIUS,
    ],
    additionalProperties: false,
};

const modifyStringValues = {
    properties: {
        [HOMELESS_COLUMNS.ZOOM]: {
            parse_string_to_int: {},
        },
        [HOMELESS_COLUMNS.CLUSTER_SW]: {
            parse_string_to_json: {},
        },
        [HOMELESS_COLUMNS.CLUSTER_NE]: {
            parse_string_to_json: {},
        },
        [HOMELESS_COLUMNS.UPLOADING_POINT]: {
            parse_string_to_json: {},
        },
        [HOMELESS_COLUMNS.DOWNLOADING_POINT]: {
            parse_string_to_json: {},
        },
        [colsCargos.GROSS_WEIGHT]: {
            parse_string_to_float: {},
        },
        [colsCargos.WIDTH]: {
            parse_string_to_float: {},
        },
        [colsCargos.HEIGHT]: {
            parse_string_to_float: {},
        },
        [colsCargos.LENGTH]: {
            parse_string_to_float: {},
        },
        [colsCargos.LOADING_METHODS]: {
            parse_string_to_json: {},
        },
        [colsCargos.GUARANTEES]: {
            parse_string_to_json: {},
        },
        [HOMELESS_COLUMNS.SEARCH_RADIUS]: {
            parse_string_to_int: {},
        }
    },
};

const searchCargoAfterModifyingQuery = {
    properties: {
        [HOMELESS_COLUMNS.ZOOM]: {
            type: 'number',
            minimum: 1,
            maximum: 16,
        },
        [HOMELESS_COLUMNS.CLUSTER_SW]: coordinatesFormatWithoutName,
        [HOMELESS_COLUMNS.CLUSTER_NE]: coordinatesFormatWithoutName,
        [HOMELESS_COLUMNS.UPLOADING_POINT]: coordinatesFormatWithoutName,
        [HOMELESS_COLUMNS.DOWNLOADING_POINT]: coordinatesFormatWithoutName,
        [colsCargos.GROSS_WEIGHT]: {
            type: 'number',
            format: 'size',
            exclusiveMinimum: 0,
            exclusiveMaximum: 1000,
        },
        [colsCargos.WIDTH]: {
            type: 'number',
            format: 'size',
            exclusiveMinimum: 0,
            exclusiveMaximum: 1000,
        },
        [colsCargos.HEIGHT]: {
            type: 'number',
            format: 'size',
            exclusiveMinimum: 0,
            exclusiveMaximum: 1000,
        },
        [colsCargos.LENGTH]: {
            type: 'number',
            format: 'size',
            exclusiveMinimum: 0,
            exclusiveMaximum: 1000,
        },
        [colsCargos.LOADING_METHODS]: {
            type: 'array',
            minItems: 1,
            uniqueItems: true,
            items: {
                enum: [LOADING_METHODS_MAP.UP, LOADING_METHODS_MAP.BACK, LOADING_METHODS_MAP.SIDE],

            },
        },
        [colsCargos.GUARANTEES]: {
            type: 'array',
            minItems: 1,
            uniqueItems: true,
            items: {
                enum: [GUARANTEES_MAP.CMR, GUARANTEES_MAP.TIR],
            },
        },
        [HOMELESS_COLUMNS.SEARCH_RADIUS]: {
            type: 'number',
            minimum: 300,
            maximum: 15000,
        },
    },
};

const searchCargoAsync = {
    $async: true,
    properties: {
        [colsCargos.DANGER_CLASS_ID]: {
            danger_class_not_exist: {},
        },
        [colsCargos.VEHICLE_TYPE_ID]: {
            vehicle_type_not_exist: {},
        },
    },
};

const searchAllCargosQuery = {
    type: 'object',
    properties: {
        [HOMELESS_COLUMNS.ZOOM]: {
            type: 'string',
            pattern: DIGITS_VALIDATION_PATTERN,
        },
        [HOMELESS_COLUMNS.CLUSTER_SW]: {
            type: 'string',
            format: 'json',
        },
        [HOMELESS_COLUMNS.CLUSTER_NE]: {
            type: 'string',
            format: 'json',
        },
        [HOMELESS_COLUMNS.LANGUAGE_CODE]: {
            type: 'string',
            minLength: 2,
            maxLength: 10,
        },
        [HOMELESS_COLUMNS.SEARCH_ITEMS]: {
            type: 'string',
        },
    },
    additionalProperties: false,
};

const searchAllCargosAfterModifyingQuery = {
    properties: {
        [HOMELESS_COLUMNS.ZOOM]: {
            type: 'number',
            minimum: 1,
            maximum: 16,
        },
        [HOMELESS_COLUMNS.CLUSTER_SW]: coordinatesFormatWithoutName,
        [HOMELESS_COLUMNS.CLUSTER_NE]: coordinatesFormatWithoutName,
    },
};

module.exports = {
    createOrEditCargo,
    createOrEditCargoAsync,
    requiredCargoId,
    requiredExistingFreeCargoAsync,
    requiredExistingCargoInCompanyAsyncFunc,
    requiredExistingCargoAsync,
    modifyStringValues,
    searchCargoQuery,
    searchCargoAfterModifyingQuery,
    searchCargoAsync,
    searchAllCargosQuery,
    searchAllCargosAfterModifyingQuery,
};
