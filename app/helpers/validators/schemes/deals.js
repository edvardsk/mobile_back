// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

// patterns
const {
    DIGITS_VALIDATION_PATTERN,
    POSTGRES_MAX_STRING_LENGTH,
} = require('./patterns');

const colsUsers = SQL_TABLES.USERS.COLUMNS;
const colsDrivers = SQL_TABLES.DRIVERS.COLUMNS;

const createCargoDeal = {
    type: 'array',
    items: [
        {
            properties: {
                [HOMELESS_COLUMNS.CARGO_ID]: {
                    type: 'string',
                    format: 'uuid',
                },
                [HOMELESS_COLUMNS.DRIVER_ID_OR_FULL_NAME]: {
                    oneOf: [
                        {
                            type: 'string',
                            format: 'uuid',
                        },
                        {
                            type: 'string',
                            minLength: 1,
                        }
                    ],
                },
                [HOMELESS_COLUMNS.CAR_ID_OR_FULL_NAME]: {
                    oneOf: [
                        {
                            type: 'string',
                            format: 'uuid',
                        },
                        {
                            type: 'string',
                            minLength: 1,
                        }
                    ],
                },
                [HOMELESS_COLUMNS.TRAILER_ID_OR_FULL_NAME]: {
                    oneOf: [
                        {
                            type: 'string',
                            format: 'uuid',
                        },
                        {
                            type: 'string',
                            minLength: 1,
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
            },
            required: [
                HOMELESS_COLUMNS.CARGO_ID,
                HOMELESS_COLUMNS.DRIVER_ID_OR_FULL_NAME,
                HOMELESS_COLUMNS.CAR_ID_OR_FULL_NAME,
                HOMELESS_COLUMNS.PAY_CURRENCY_ID,
                HOMELESS_COLUMNS.PAY_VALUE,
            ],
            additionalProperties: false,
        },
    ],
    minItems: 1,
    uniqueItems: true,
};

module.exports = {
    createCargoDeal,
};
