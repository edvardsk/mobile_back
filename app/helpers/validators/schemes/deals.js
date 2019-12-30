// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { DOCUMENTS } = require('constants/files');

// patterns
const {
    DIGITS_VALIDATION_PATTERN,
    POSTGRES_MAX_STRING_LENGTH,
    DOUBLE_NUMBER_VALIDATION_PATTERN,
    PHONE_NUMBER_VALIDATION_PATTERN,
} = require('./patterns');

// helpers
const { fileFormat } = require('./helpers');

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';

const colsUsers = SQL_TABLES.USERS.COLUMNS;
const colsDeals = SQL_TABLES.DEALS.COLUMNS;
const colsDealPointsInfo = SQL_TABLES.DEAL_POINTS_INFO.COLUMNS;

const createCargoDeal = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            [HOMELESS_COLUMNS.CARGO_ID]: {
                type: 'string',
                format: 'uuid',
            },
            [HOMELESS_COLUMNS.DRIVER_ID_OR_DATA]: {
                oneOf: [
                    {
                        type: 'string',
                        format: 'uuid',
                    },
                    {
                        type: 'object',
                        properties: {
                            [colsUsers.FULL_NAME]: {
                                type: 'string',
                                minLength: 3,
                            },
                            [HOMELESS_COLUMNS.PHONE_PREFIX_ID]: {
                                type: 'string',
                                format: 'uuid',
                            },
                            [HOMELESS_COLUMNS.PHONE_NUMBER]: {
                                type: 'string',
                                pattern: DIGITS_VALIDATION_PATTERN,
                            },
                        },
                        required: [
                            colsUsers.FULL_NAME,
                            HOMELESS_COLUMNS.PHONE_PREFIX_ID,
                            HOMELESS_COLUMNS.PHONE_NUMBER,
                        ],
                        additionalProperties: false,
                    }
                ],
            },
            [HOMELESS_COLUMNS.CAR_ID_OR_DATA]: {
                oneOf: [
                    {
                        type: 'string',
                        format: 'uuid',
                    },
                    {
                        type: 'object',
                        properties: {
                            [HOMELESS_COLUMNS.CAR_STATE_NUMBER]: {
                                type: 'string',
                                minLength: 3,
                            },
                        },
                        required: [
                            HOMELESS_COLUMNS.CAR_STATE_NUMBER,
                        ],
                        additionalProperties: false,
                    }
                ],
            },
            [HOMELESS_COLUMNS.TRAILER_ID_OR_DATA]: {
                oneOf: [
                    {
                        type: 'string',
                        format: 'uuid',
                    },
                    {
                        type: 'object',
                        properties: {
                            [HOMELESS_COLUMNS.TRAILER_STATE_NUMBER]: {
                                type: 'string',
                                minLength: 3,
                            },
                        },
                        required: [
                            HOMELESS_COLUMNS.TRAILER_STATE_NUMBER,
                        ],
                        additionalProperties: false,
                    }
                ],
            },
            [HOMELESS_COLUMNS.PAY_CURRENCY_ID]: {
                type: 'string',
                format: 'uuid',
            },
            [HOMELESS_COLUMNS.PAY_VALUE]: {
                type: 'number',
                format: 'price',
            },
            [colsDeals.NAME]: {
                type: 'string',
                minLength: 1,
            },
        },
        required: [
            HOMELESS_COLUMNS.CARGO_ID,
            HOMELESS_COLUMNS.DRIVER_ID_OR_DATA,
            HOMELESS_COLUMNS.CAR_ID_OR_DATA,
            HOMELESS_COLUMNS.PAY_CURRENCY_ID,
            HOMELESS_COLUMNS.PAY_VALUE,
        ],
        additionalProperties: false,
    },
    minItems: 1,
};

const createCarDeal = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            [HOMELESS_COLUMNS.CARGO_ID]: {
                type: 'string',
                format: 'uuid',
            },
            [HOMELESS_COLUMNS.CAR_ID_OR_DATA]: {
                oneOf: [
                    {
                        type: 'string',
                        format: 'uuid',
                    },
                    {
                        type: 'object',
                        properties: {
                            [HOMELESS_COLUMNS.CAR_STATE_NUMBER]: {
                                type: 'string',
                                minLength: 3,
                            },
                        },
                        required: [
                            HOMELESS_COLUMNS.CAR_STATE_NUMBER,
                        ],
                        additionalProperties: false,
                    }
                ],
            },
            [HOMELESS_COLUMNS.TRAILER_ID_OR_DATA]: {
                oneOf: [
                    {
                        type: 'string',
                        format: 'uuid',
                    },
                    {
                        type: 'object',
                        properties: {
                            [HOMELESS_COLUMNS.TRAILER_STATE_NUMBER]: {
                                type: 'string',
                                minLength: 3,
                            },
                        },
                        required: [
                            HOMELESS_COLUMNS.TRAILER_STATE_NUMBER,
                        ],
                        additionalProperties: false,
                    }
                ],
            },
            [HOMELESS_COLUMNS.PAY_CURRENCY_ID]: {
                type: 'string',
                format: 'uuid',
            },
            [HOMELESS_COLUMNS.PAY_VALUE]: {
                type: 'number',
                format: 'price',
            },
            [colsDeals.NAME]: {
                type: 'string',
                minLength: 1,
            },
        },
        required: [
            HOMELESS_COLUMNS.CARGO_ID,
            HOMELESS_COLUMNS.CAR_ID_OR_DATA,
            HOMELESS_COLUMNS.PAY_CURRENCY_ID,
            HOMELESS_COLUMNS.PAY_VALUE,
        ],
        additionalProperties: false,
    },
    minItems: 1,
};

const createCargoDealAsync = {
    $async: true,
    type: 'array',
    items: {
        type: 'object',
        properties: {
            [HOMELESS_COLUMNS.DRIVER_ID_OR_DATA]: {
                oneOf: [
                    {
                        type: 'string',
                        format: 'uuid',
                    },
                    {
                        type: 'object',
                        properties: {
                            [HOMELESS_COLUMNS.PHONE_PREFIX_ID]: {
                                type: 'string',
                                format: 'uuid',
                            },
                        },
                    }
                ],
            },
        },
    },
};

const createCargoDealPhoneNumberAsync = {
    $async: true,
    type: 'array',
    items: {
        type: 'object',
        properties: {
            [HOMELESS_COLUMNS.DRIVER_ID_OR_DATA]: {
                oneOf: [
                    {
                        type: 'string',
                        format: 'uuid',
                    },
                    {
                        type: 'object',
                        properties: {
                            [HOMELESS_COLUMNS.PHONE_PREFIX_ID]: {
                                phone_prefix_not_exist: {},
                            },
                            [HOMELESS_COLUMNS.PHONE_NUMBER]: {
                                phone_number_exists: {},
                            },
                        },
                    }
                ],
            },
        },
    },
};

const createCargoDealPhoneNumberWithPrefixAsync = {
    $async: true,
    type: 'array',
    items: {
        type: 'object',
        properties: {
            [HOMELESS_COLUMNS.DRIVER_ID_OR_DATA]: {
                oneOf: [
                    {
                        type: 'string',
                        format: 'uuid',
                    },
                    {
                        type: 'object',
                        properties: {
                            [HOMELESS_COLUMNS.PHONE_NUMBER]: {
                                phone_number_not_valid: {},
                            },
                        },
                    }
                ],
            },
        },
    },
};

const requiredDealId = {
    properties: {
        dealId: {
            type: 'string',
            format: 'uuid',
        },
    },
};

const requiredExistingOwnDealAsyncFunc = ({ companyId }) => ({
    $async: true,
    properties: {
        dealId: {
            own_active_deal_not_exists: {
                companyId,
            },
        },
    },
});

const changeDealStatusPrimary = {
    properties: {
        dealId: {

        },
    },
};

const validateNextStepAsyncFunc = ({ nextStatus }) => ({
    $async: true,
    properties: {
        dealId: {
            deal_status_not_allowed: {
                nextStatus,
            },
        },
    },
});

const validateNextStepConfirmedTransporter = {
    properties: {
        [HOMELESS_COLUMNS.DRIVER_ID]: {
            type: 'string',
            format: 'uuid',
        },
    },
    required: [
        HOMELESS_COLUMNS.DRIVER_ID,
    ],
    additionalProperties: false,
};

const validateNextStepConfirmedHolder = {
    properties: {
        [colsDeals.DEPARTURE_CUSTOMS_COUNTRY]: {
            type: 'string',
            minLength: 1,
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [colsDeals.DEPARTURE_CUSTOMS_PERSON_FULL_NAME]: {
            type: 'string',
            minLength: 1,
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [colsDeals.DEPARTURE_CUSTOMS_PERSON_FULL_PHONE_NUMBER]: {
            type: 'string',
            pattern: PHONE_NUMBER_VALIDATION_PATTERN,
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [colsDeals.ARRIVAL_CUSTOMS_COUNTRY]: {
            type: 'string',
            minLength: 1,
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [colsDeals.ARRIVAL_CUSTOMS_PERSON_FULL_NAME]: {
            type: 'string',
            minLength: 1,
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [colsDeals.ARRIVAL_CUSTOMS_PERSON_FULL_PHONE_NUMBER]: {
            type: 'string',
            pattern: PHONE_NUMBER_VALIDATION_PATTERN,
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [colsDeals.TNVED_CODE]: {
            type: 'string',
            minLength: 1,
        },
        [colsDeals.INVOICE_CURRENCY_ID]: {
            type: 'string',
            format: 'uuid',
        },
        [colsDeals.INVOICE_PRICE]: {
            type: 'string',
            pattern: DOUBLE_NUMBER_VALIDATION_PATTERN,
        },
        [colsDeals.STANDARD_LOADING_TIME_HOURS]: {
            type: 'string',
            pattern: DIGITS_VALIDATION_PATTERN,
        },
        [colsDeals.SPECIAL_REQUIREMENTS]: {
            type: 'string',
            minLength: 1,
        },
    },
    patternProperties: {
        [`${HOMELESS_COLUMNS.UPLOADING_POINT}.${UUID}.${colsDealPointsInfo.POINT_ADDRESS}`]: {
            type: 'string',
            minLength: 1,
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [`${HOMELESS_COLUMNS.UPLOADING_POINT}.${UUID}.${colsDealPointsInfo.POINT_PERSON_FULL_NAME}`]: {
            type: 'string',
            minLength: 1,
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [`${HOMELESS_COLUMNS.UPLOADING_POINT}.${UUID}.${colsDealPointsInfo.POINT_PERSON_FULL_PHONE_NUMBER}`]: {
            type: 'string',
            pattern: PHONE_NUMBER_VALIDATION_PATTERN,
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [`${HOMELESS_COLUMNS.DOWNLOADING_POINT}.${UUID}.${colsDealPointsInfo.POINT_ADDRESS}`]: {
            type: 'string',
            minLength: 1,
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [`${HOMELESS_COLUMNS.DOWNLOADING_POINT}.${UUID}.${colsDealPointsInfo.POINT_PERSON_FULL_NAME}`]: {
            type: 'string',
            minLength: 1,
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [`${HOMELESS_COLUMNS.DOWNLOADING_POINT}.${UUID}.${colsDealPointsInfo.POINT_PERSON_FULL_PHONE_NUMBER}`]: {
            type: 'string',
            pattern: PHONE_NUMBER_VALIDATION_PATTERN,
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
    },
    additionalProperties: false,
};

const validateNextStepConfirmedHolderFiles = {
    properties: {
        [DOCUMENTS.CARGO_PHOTO]: fileFormat,
        [DOCUMENTS.TNVED_FILE]: fileFormat,
        [DOCUMENTS.INVOICE_FILE]: fileFormat,
    },
    additionalProperties: false,
};

const validateNextStepConfirmedHolderBodyWithFiles = {
    dependencies: {
        [colsDeals.DEPARTURE_CUSTOMS_COUNTRY]: [
            colsDeals.DEPARTURE_CUSTOMS_PERSON_FULL_NAME,
            colsDeals.DEPARTURE_CUSTOMS_PERSON_FULL_PHONE_NUMBER,

            colsDeals.ARRIVAL_CUSTOMS_COUNTRY,
            colsDeals.ARRIVAL_CUSTOMS_PERSON_FULL_NAME,
            colsDeals.ARRIVAL_CUSTOMS_PERSON_FULL_PHONE_NUMBER,
        ],
        [colsDeals.DEPARTURE_CUSTOMS_PERSON_FULL_NAME]: [
            colsDeals.DEPARTURE_CUSTOMS_COUNTRY,
            colsDeals.DEPARTURE_CUSTOMS_PERSON_FULL_PHONE_NUMBER,

            colsDeals.ARRIVAL_CUSTOMS_COUNTRY,
            colsDeals.ARRIVAL_CUSTOMS_PERSON_FULL_NAME,
            colsDeals.ARRIVAL_CUSTOMS_PERSON_FULL_PHONE_NUMBER,
        ],
        [colsDeals.DEPARTURE_CUSTOMS_PERSON_FULL_PHONE_NUMBER]: [
            colsDeals.DEPARTURE_CUSTOMS_COUNTRY,
            colsDeals.DEPARTURE_CUSTOMS_PERSON_FULL_NAME,

            colsDeals.ARRIVAL_CUSTOMS_COUNTRY,
            colsDeals.ARRIVAL_CUSTOMS_PERSON_FULL_NAME,
            colsDeals.ARRIVAL_CUSTOMS_PERSON_FULL_PHONE_NUMBER,
        ],
        [colsDeals.ARRIVAL_CUSTOMS_COUNTRY]: [
            colsDeals.DEPARTURE_CUSTOMS_COUNTRY,
            colsDeals.DEPARTURE_CUSTOMS_PERSON_FULL_NAME,
            colsDeals.DEPARTURE_CUSTOMS_PERSON_FULL_PHONE_NUMBER,

            colsDeals.ARRIVAL_CUSTOMS_PERSON_FULL_NAME,
            colsDeals.ARRIVAL_CUSTOMS_PERSON_FULL_PHONE_NUMBER,
        ],
        [colsDeals.ARRIVAL_CUSTOMS_PERSON_FULL_NAME]: [
            colsDeals.DEPARTURE_CUSTOMS_COUNTRY,
            colsDeals.DEPARTURE_CUSTOMS_PERSON_FULL_NAME,
            colsDeals.DEPARTURE_CUSTOMS_PERSON_FULL_PHONE_NUMBER,

            colsDeals.ARRIVAL_CUSTOMS_COUNTRY,
            colsDeals.ARRIVAL_CUSTOMS_PERSON_FULL_PHONE_NUMBER,
        ],
        [colsDeals.ARRIVAL_CUSTOMS_PERSON_FULL_PHONE_NUMBER]: [
            colsDeals.DEPARTURE_CUSTOMS_COUNTRY,
            colsDeals.DEPARTURE_CUSTOMS_PERSON_FULL_NAME,
            colsDeals.DEPARTURE_CUSTOMS_PERSON_FULL_PHONE_NUMBER,

            colsDeals.ARRIVAL_CUSTOMS_COUNTRY,
            colsDeals.ARRIVAL_CUSTOMS_PERSON_FULL_NAME,
        ],
        [colsDeals.TNVED_CODE]: [
            DOCUMENTS.TNVED_FILE,
        ],
        [DOCUMENTS.TNVED_FILE]: [
            colsDeals.TNVED_CODE,
        ],
        [colsDeals.INVOICE_PRICE]: [
            colsDeals.INVOICE_CURRENCY_ID,
            DOCUMENTS.INVOICE_FILE,
        ],
        [colsDeals.INVOICE_CURRENCY_ID]: [
            colsDeals.INVOICE_PRICE,
            DOCUMENTS.INVOICE_FILE,
        ],
        [DOCUMENTS.INVOICE_FILE]: [
            colsDeals.INVOICE_PRICE,
            colsDeals.INVOICE_CURRENCY_ID,
        ],
    },
};

const validateNextStepConfirmedHolderAsync = {
    $async: true,
    properties: {
        [colsDeals.INVOICE_CURRENCY_ID]: {
            currency_not_exist: {},
        },
    },
};

module.exports = {
    createCargoDeal,
    createCargoDealAsync,
    createCargoDealPhoneNumberAsync,
    createCargoDealPhoneNumberWithPrefixAsync,
    requiredDealId,
    requiredExistingOwnDealAsyncFunc,
    changeDealStatusPrimary,
    validateNextStepAsyncFunc,
    validateNextStepConfirmedTransporter,
    validateNextStepConfirmedHolder,
    validateNextStepConfirmedHolderFiles,
    validateNextStepConfirmedHolderBodyWithFiles,
    validateNextStepConfirmedHolderAsync,
    createCarDeal,
};
