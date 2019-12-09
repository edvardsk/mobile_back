// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const colsCargos = SQL_TABLES.CARGOS.COLUMNS;

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
                    type: 'string',
                    minLength: 1,
                },
                [HOMELESS_COLUMNS.CAR_ID_OR_STATE_NUMBER]: {
                    type: 'string',
                    minLength: 1,
                },
                [HOMELESS_COLUMNS.TRAILER_ID_OR_STATE_NUMBER]: {
                    type: 'string',
                    minLength: 1,
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
                HOMELESS_COLUMNS.DRIVER_ID_OR_FULL_NAME,
                HOMELESS_COLUMNS.CAR_ID_OR_STATE_NUMBER,
                HOMELESS_COLUMNS.PAY_CURRENCY_ID,
                HOMELESS_COLUMNS.PAY_VALUE,
                colsCargos.COUNT,
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
