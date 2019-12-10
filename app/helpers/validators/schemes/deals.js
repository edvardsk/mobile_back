// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

// patterns
const { DIGITS_VALIDATION_PATTERN } = require('./patterns');

const colsCargos = SQL_TABLES.CARGOS.COLUMNS;
const colsUsers = SQL_TABLES.USERS.COLUMNS;

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
            [colsCargos.COUNT]: {
                type: 'number',
                minimum: 1,
            },
        },
        required: [
            HOMELESS_COLUMNS.CARGO_ID,
            HOMELESS_COLUMNS.DRIVER_ID_OR_DATA,
            HOMELESS_COLUMNS.CAR_ID_OR_DATA,
            HOMELESS_COLUMNS.PAY_CURRENCY_ID,
            HOMELESS_COLUMNS.PAY_VALUE,
            colsCargos.COUNT,
        ],
        additionalProperties: false,
    },
    minItems: 1,
    uniqueItems: true,
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

module.exports = {
    createCargoDeal,
    createCargoDealAsync,
    createCargoDealPhoneNumberAsync,
    createCargoDealPhoneNumberWithPrefixAsync,
};
