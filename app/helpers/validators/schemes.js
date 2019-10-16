
// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const colsUsers = SQL_TABLES.USERS.COLUMNS;
const colsCompanies = SQL_TABLES.COMPANIES.COLUMNS;
const colsPhoneConfirmation = SQL_TABLES.PHONE_CONFIRMATION_CODES.COLUMNS;

const UUID_VALIDATION_PATTER = '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
const DIGITS_VALIDATION_PATTERN = '^\\d+$';
const PASSWORD_VALIDATION_PATTERN = '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,}$';
const URL_VALIDATION_PATTERN = '^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&\'\\(\\)\\*\\+,;=.]+$';

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
        },
        [colsUsers.PASSWORD]: {
            type: 'string',
            pattern: PASSWORD_VALIDATION_PATTERN,
        },
        [HOMELESS_COLUMNS.ROLE_ID]: {
            type: 'string',
            pattern: UUID_VALIDATION_PATTER,
        },
        [HOMELESS_COLUMNS.PHONE_NUMBER]: {
            type: 'string',
            pattern: DIGITS_VALIDATION_PATTERN,
        },
        [HOMELESS_COLUMNS.PHONE_PREFIX_ID]: {
            type: 'string',
            pattern: UUID_VALIDATION_PATTER,
            phonePrefixExists: {},
        }
    },
    required: [
        colsUsers.EMAIL,
        colsUsers.PASSWORD,
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

const finishRegistrationStep1Transporter = {
    $async: true,
    properties: {
        [colsCompanies.NAME]: {
            type: 'string',
            maxLength: 255,
        },
        [colsCompanies.OWNERSHIP_TYPE]: {
            type: 'string',
            maxLength: 50,
        },
        [colsCompanies.REGISTERED_AT]: {
            type: 'string',
            format: 'date',
        },
        [colsCompanies.COUNTRY_ID]: {
            type: 'string',
            pattern: UUID_VALIDATION_PATTER,
            countryExists: {},
        },
        [colsCompanies.IDENTITY_NUMBER]: {
            type: 'string',
            maxLength: 12,
        },
        [colsCompanies.WEBSITE]: {
            type: 'string',
            maxLength: 255,
            pattern: URL_VALIDATION_PATTERN,
        }
    },
    required: [
        colsCompanies.NAME,
        colsCompanies.OWNERSHIP_TYPE,
        colsCompanies.REGISTERED_AT,
        colsCompanies.COUNTRY_ID,
        colsCompanies.IDENTITY_NUMBER,
    ],
    additionalProperties: false,
};

const finishRegistrationStep1Holder = {
    $async: true,
    properties: {
        [colsCompanies.NAME]: {
            type: 'string',
            maxLength: 255,
        },
        [colsCompanies.OWNERSHIP_TYPE]: {
            type: 'string',
            maxLength: 50,
        },
        [colsCompanies.REGISTERED_AT]: {
            type: 'string',
            format: 'date',
        },
        [colsCompanies.COUNTRY_ID]: {
            type: 'string',
            pattern: UUID_VALIDATION_PATTER,
            countryExists: {},
        },
        [colsCompanies.IDENTITY_NUMBER]: {
            type: 'string',
            maxLength: 12,
        },
        [colsCompanies.WEBSITE]: {
            type: 'string',
            maxLength: 255,
        }
    },
    required: [
        colsCompanies.NAME,
        colsCompanies.OWNERSHIP_TYPE,
        colsCompanies.REGISTERED_AT,
        colsCompanies.COUNTRY_ID,
        colsCompanies.IDENTITY_NUMBER,
    ],
    additionalProperties: false,
};

const finishRegistrationStep1Forwarder = {
    $async: true,
    properties: {
        [colsUsers.FULL_NAME]: {
            type: 'string',
            maxLength: 255,
        },
        [colsCompanies.NAME]: {
            type: 'string',
            maxLength: 255,
        },
        [colsCompanies.REGISTERED_AT]: {
            type: 'string',
            format: 'date',
        },
        [colsCompanies.COUNTRY_ID]: {
            type: 'string',
            pattern: UUID_VALIDATION_PATTER,
            countryExists: {},
        },
        [colsCompanies.IDENTITY_NUMBER]: {
            type: 'string',
            maxLength: 12,
        },
        [colsCompanies.WEBSITE]: {
            type: 'string',
            maxLength: 255,
        }
    },
    dependencies: {
        [colsCompanies.NAME]: {
            required: [colsCompanies.REGISTERED_AT],
        },
        [colsCompanies.REGISTERED_AT]: {
            required: [colsCompanies.NAME],
        },
    },
    required: [
        colsUsers.FULL_NAME,
        colsCompanies.COUNTRY_ID,
        colsCompanies.IDENTITY_NUMBER,
    ],
    additionalProperties: false,
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

    finishRegistrationStep1Transporter,
    finishRegistrationStep1Holder,
    finishRegistrationStep1Forwarder,

    companyFilesTransporter,
    companyFilesHolder,
    companyFilesForwarder,

    confirmPhoneNumber,
};
