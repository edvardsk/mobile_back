// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

// patterns
const {
    POSTGRES_MAX_STRING_LENGTH,
    SUPPORTED_MIMTYPES,
    DOUBLE_NUMBER_VALIDATION_PATTERN,
} = require('./patterns');

const colsOtherOrganizations = SQL_TABLES.OTHER_ORGANIZATIONS.COLUMNS;

const fileFormat = {
    type: 'array',
    items: {
        properties: {
            fieldname: {
                type: 'string',
                maxLength: POSTGRES_MAX_STRING_LENGTH,

            },
            originalname: {
                type: 'string',
            },
            buffer: {
                instanceof: 'Buffer',
            },
            mimetype: {
                enum: SUPPORTED_MIMTYPES,
            },
        },
        required: ['fieldname', 'originalname', 'buffer', 'mimetype']
    },
};

const coordinatesFormat = {
    properties: {
        [HOMELESS_COLUMNS.LATITUDE]: {
            type: 'string',
            pattern: DOUBLE_NUMBER_VALIDATION_PATTERN,
        },
        [HOMELESS_COLUMNS.LONGITUDE]: {
            type: 'string',
            pattern: DOUBLE_NUMBER_VALIDATION_PATTERN,
        },
        [HOMELESS_COLUMNS.NAME_EN]: {
            type: 'string',
            minLength: 1,
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
    },
    required: [HOMELESS_COLUMNS.LATITUDE, HOMELESS_COLUMNS.LONGITUDE, HOMELESS_COLUMNS.NAME_EN],
    additionalProperties: false,
};

const coordinatesFormatWithoutName = {
    type: 'object',
    properties: {
        [HOMELESS_COLUMNS.LATITUDE]: {
            type: 'string',
            pattern: DOUBLE_NUMBER_VALIDATION_PATTERN,
        },
        [HOMELESS_COLUMNS.LONGITUDE]: {
            type: 'string',
            pattern: DOUBLE_NUMBER_VALIDATION_PATTERN,
        },
    },
    required: [HOMELESS_COLUMNS.LATITUDE, HOMELESS_COLUMNS.LONGITUDE],
    additionalProperties: false,
};

const otherOrganizations = {
    type: 'array',
    items: {
        properties: {
            [colsOtherOrganizations.IDENTITY_NUMBER]: {
                type: 'string',
                minLength: 9,
                maxLength: 12,
            },
            [colsOtherOrganizations.NAME]: {
                type: 'string',
                maxLength: POSTGRES_MAX_STRING_LENGTH,
            },
        },
        required: [colsOtherOrganizations.IDENTITY_NUMBER, colsOtherOrganizations.NAME],
        additionalProperties: false,
    },
    minItems: 1,
    uniqueItems: true,
};

module.exports = {
    fileFormat,
    coordinatesFormat,
    otherOrganizations,
    coordinatesFormatWithoutName,
};
