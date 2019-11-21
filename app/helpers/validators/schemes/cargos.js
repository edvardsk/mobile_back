// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const {
    LOADING_METHODS_MAP,
    LOADING_TYPES_MAP,
    GUARANTEES_MAP,
} = require('constants/cargos');

// helpers
const { cargoCoordinatesFormat } = require('./helpers');

// exported schemes
const colsCargos = SQL_TABLES.CARGOS.COLUMNS;

const createOrEditCargo = {
    properties: {
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
            formatMinimum: {
                '$data': `1/${colsCargos.DOWNLOADING_DATE_FROM}`,
            },
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
        [HOMELESS_COLUMNS.UPLOADING_POINTS]: {
            type: 'array',
            minItems: 1,
            uniqueItems: true,
            items: cargoCoordinatesFormat,
        },
        [HOMELESS_COLUMNS.DOWNLOADING_POINTS]: {
            type: 'array',
            minItems: 1,
            uniqueItems: true,
            items: cargoCoordinatesFormat
        },
    },
    required:[
        colsCargos.UPLOADING_DATE_FROM,
        colsCargos.DOWNLOADING_DATE_FROM,
        colsCargos.GROSS_WEIGHT,
        colsCargos.WIDTH,
        colsCargos.HEIGHT,
        colsCargos.LENGTH,
        colsCargos.LOADING_METHODS,
        colsCargos.LOADING_TYPE,
        colsCargos.GUARANTEES,
        colsCargos.VEHICLE_TYPE_ID,
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
    },
    additionalProperties: true,
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

module.exports = {
    createOrEditCargo,
    createOrEditCargoAsync,
    requiredExistingCargoInCompanyAsyncFunc,
};
