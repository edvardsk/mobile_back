// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

// patterns
const {
    DIGITS_VALIDATION_PATTERN,
    POSTGRES_MAX_STRING_LENGTH,
} = require('./patterns');

const colsUsers = SQL_TABLES.USERS.COLUMNS;
const colsDrivers = SQL_TABLES.DRIVERS.COLUMNS;

const createOrModifyDriver = {
    properties: {
        [colsUsers.EMAIL]: {
            type: 'string',
            format: 'email',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [colsUsers.FULL_NAME]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [HOMELESS_COLUMNS.PHONE_PREFIX_ID]: {
            type: 'string',
            format: 'uuid',
        },
        [HOMELESS_COLUMNS.PHONE_NUMBER]: {
            type: 'string',
            pattern: DIGITS_VALIDATION_PATTERN,
        },
        [colsDrivers.DRIVER_LICENCE_REGISTERED_AT]: {
            type: 'string',
            format: 'date',
        },
        [colsDrivers.DRIVER_LICENCE_EXPIRED_AT]: {
            type: 'string',
            format: 'date',
        },
    },
    required: [
        colsUsers.EMAIL,
        colsUsers.FULL_NAME,
        HOMELESS_COLUMNS.PHONE_PREFIX_ID,
        HOMELESS_COLUMNS.PHONE_NUMBER,
        colsDrivers.DRIVER_LICENCE_REGISTERED_AT,
        colsDrivers.DRIVER_LICENCE_EXPIRED_AT,
    ],
    additionalProperties: false,
};

const modifyEmployeeAsyncFunc = userId => ({
    $async: true,
    properties: {
        [colsUsers.EMAIL]: {
            email_exists: {
                userId,
            },
        },
        [HOMELESS_COLUMNS.PHONE_PREFIX_ID]: {
            phone_prefix_not_exist: {},
        },
        [HOMELESS_COLUMNS.PHONE_NUMBER]: {
            phone_number_exists: {
                userId
            },
        },
    },
    additionalProperties: true,
});


module.exports = {
    createOrModifyDriver,
    modifyEmployeeAsyncFunc,
};
