
// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const colsUsers = SQL_TABLES.USERS.COLUMNS;
const colsCompanies = SQL_TABLES.COMPANIES.COLUMNS;
const colsPhoneConfirmation = SQL_TABLES.PHONE_CONFIRMATION_CODES.COLUMNS;

const DIGITS_VALIDATION_PATTERN = '^\\d+$';
const PASSWORD_VALIDATION_PATTERN = '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,}$';

// helpers
const fileFormat = {
    type: 'array',
    items: [
        {
            properties: {
                fieldname: {
                    type: 'string',
                },
                originaname: {
                    type: 'string',
                },
                buffer: {
                    instanceof: 'Buffer',
                },
            },
        },
    ],
};
// helpers

const registration = {
    $async: true,
    properties: {
        [colsUsers.EMAIL]: {
            type: 'string',
            format: 'email',
            maxLength: 255,
        },
        [colsUsers.PASSWORD]: {
            type: 'string',
            maxLength: 255,
            pattern: PASSWORD_VALIDATION_PATTERN,
        },
        [colsUsers.FULL_NAME]: {
            type: 'string',
            maxLength: 255,
        },
        [HOMELESS_COLUMNS.ROLE_ID]: {
            type: 'string',
            format: 'uuid',
            roleExists: {},
        },
        [HOMELESS_COLUMNS.PHONE_PREFIX_ID]: {
            type: 'string',
            format: 'uuid',
            phonePrefixExists: {},
        },
        [HOMELESS_COLUMNS.PHONE_NUMBER]: {
            type: 'string',
            pattern: DIGITS_VALIDATION_PATTERN,
            phoneNumberValid: {},
        },
    },
    required: [
        colsUsers.EMAIL,
        colsUsers.PASSWORD,
        colsUsers.FULL_NAME,
        HOMELESS_COLUMNS.ROLE_ID,
        HOMELESS_COLUMNS.PHONE_NUMBER,
        HOMELESS_COLUMNS.PHONE_PREFIX_ID,
    ],
};

const authorization = {
    properties: {
        [colsUsers.EMAIL]: {
            type: 'string',
            format: 'email',
        },
        [colsUsers.PASSWORD]: {
            type: 'string',
            pattern: PASSWORD_VALIDATION_PATTERN,
        },
    },
    required: [colsUsers.EMAIL, colsUsers.PASSWORD],
};

const companyFieldsTransporter = {
    properties: {
        [colsCompanies.NAME]: {
            type: 'string',
        },
    },
    required: [colsCompanies.NAME],
};

const companyFieldsHolder = {
    properties: {
        [colsCompanies.NAME]: {
            type: 'string',
        },
    },
    required: [colsCompanies.NAME],
};

const companyFieldsForwarder = {
    properties: {
        [colsCompanies.NAME]: {
            type: 'string',
        },
    },
    required: [colsCompanies.NAME],
};

const companyFilesTransporter = {
    properties: {
        passport: fileFormat,
        plan: fileFormat,
    },
    required: ['passport', 'plan'],
    additionalProperties: false,
};

const companyFilesHolder = {
    properties: {
        passport: fileFormat,
        plan: fileFormat,
    },
    required: ['passport', 'plan'],
    additionalProperties: false,
};

const companyFilesForwarder = {
    properties: {
        passport: fileFormat,
        plan: fileFormat,
    },
    required: ['passport', 'plan'],
    additionalProperties: false,
};

const confirmPhoneNumber = {
    properties: {
        [colsPhoneConfirmation.CODE]: {
            type: 'string',
            maxLength: 6,
            minLength: 6,
            pattern: DIGITS_VALIDATION_PATTERN,
        }
    },
    required: [colsPhoneConfirmation.CODE],
    additionalProperties: false,
};

module.exports = {
    registration,
    authorization,
    companyFieldsTransporter,
    companyFieldsHolder,
    companyFieldsForwarder,
    companyFilesTransporter,
    companyFilesHolder,
    companyFilesForwarder,
    confirmPhoneNumber,
};
