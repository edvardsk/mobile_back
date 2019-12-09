// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

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
                            }
                        },
                        required: [
                            colsUsers.FULL_NAME,
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

module.exports = {
    createCargoDeal,
};
