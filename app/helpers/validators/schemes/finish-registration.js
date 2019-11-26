// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { DOCUMENTS } = require('constants/files');

// patterns
const {
    DIGITS_VALIDATION_PATTERN,
    URL_VALIDATION_PATTERN,
    LETTERS_AND_DIGITS_VALIDATION_PATTERN,
    POSTGRES_MAX_STRING_LENGTH,
} = require('./patterns');

// helpers
const {
    coordinatesFormat,
    otherOrganizations,
    fileFormat,
} = require('./helpers');

const colsUsers = SQL_TABLES.USERS.COLUMNS;
const colsCompanies = SQL_TABLES.COMPANIES.COLUMNS;
const colsRoutes = SQL_TABLES.ROUTES.COLUMNS;

const finishRegistrationStep1Transporter = {
    properties: {
        [colsCompanies.NAME]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
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
            format: 'uuid',
        },
        [colsCompanies.IDENTITY_NUMBER]: {
            type: 'string',
            minLength: 9,
            maxLength: 12,
        },
        [colsCompanies.WEBSITE]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
            pattern: URL_VALIDATION_PATTERN,
        },
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

const finishRegistrationStep1TransporterAsyncFunc = ({ userId, companyId }) => ({
    $async: true,
    properties: {
        [colsCompanies.COUNTRY_ID]: {
            country_not_exist: {},
        },
        [colsCompanies.IDENTITY_NUMBER]: {
            company_with_identity_number_exists: {
                userId,
                companyId,
            },
        },
        [colsCompanies.NAME]: {
            company_with_name_exists: {
                userId,
                companyId,
            },
        },
    },
    additionalProperties: true,
});

const finishRegistrationStep1Holder = {
    properties: {
        [colsCompanies.NAME]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
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
            format: 'uuid',
        },
        [colsCompanies.IDENTITY_NUMBER]: {
            type: 'string',
            minLength: 9,
            maxLength: 12,
        },
        [colsCompanies.WEBSITE]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
            pattern: URL_VALIDATION_PATTERN,
        },
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

const finishRegistrationStep1HolderAsyncFunc = ({ userId, companyId }) => ({
    $async: true,
    properties: {
        [colsCompanies.COUNTRY_ID]: {
            country_not_exist: {},
        },
        [colsCompanies.IDENTITY_NUMBER]: {
            company_with_identity_number_exists: {
                userId,
                companyId,
            },
        },
        [colsCompanies.NAME]: {
            company_with_name_exists: {
                userId,
                companyId,
            },
        },
    },
    additionalProperties: true,
});

const finishRegistrationStep1IndividualForwarder = {
    properties: {
        [colsCompanies.COUNTRY_ID]: {
            type: 'string',
            format: 'uuid',
        },
        [colsCompanies.IDENTITY_NUMBER]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [colsCompanies.WEBSITE]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
            pattern: URL_VALIDATION_PATTERN,
        }
    },
    required: [
        colsCompanies.COUNTRY_ID,
        colsCompanies.IDENTITY_NUMBER,
    ],
    additionalProperties: false,
};

const finishRegistrationStep1IndividualForwarderAsyncFunc = ({ userId, companyId }) => ({
    $async: true,
    properties: {
        [colsCompanies.COUNTRY_ID]: {
            country_not_exist: {},
        },
        [colsCompanies.IDENTITY_NUMBER]: {
            company_with_identity_number_exists: {
                userId,
                companyId,
            },
        },
    },
    additionalProperties: true,
});

const finishRegistrationStep1SoleProprietorForwarder = {
    properties: {
        [colsCompanies.NAME]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [colsCompanies.REGISTERED_AT]: {
            type: 'string',
            format: 'date',
        },
        [colsCompanies.COUNTRY_ID]: {
            type: 'string',
            format: 'uuid',
        },
        [colsCompanies.IDENTITY_NUMBER]: {
            type: 'string',
            minLength: 9,
            maxLength: 12,
        },
        [colsCompanies.WEBSITE]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
            pattern: URL_VALIDATION_PATTERN,
        }
    },
    required: [
        colsCompanies.NAME,
        colsCompanies.REGISTERED_AT,
        colsCompanies.COUNTRY_ID,
        colsCompanies.IDENTITY_NUMBER,
    ],
    additionalProperties: false,
};

const finishRegistrationStep1SoleProprietorForwarderAsyncFunc = ({ userId, companyId }) => ({
    $async: true,
    properties: {
        [colsCompanies.COUNTRY_ID]: {
            country_not_exist: {},
        },
        [colsCompanies.IDENTITY_NUMBER]: {
            company_with_identity_number_exists: {
                userId,
                companyId,
            },
        },
    },
    additionalProperties: true,
});

const finishRegistrationStep2Transporter = {
    properties: {
        [colsCompanies.LEGAL_CITY_COORDINATES]: coordinatesFormat,
        [colsCompanies.LEGAL_ADDRESS]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [colsCompanies.SETTLEMENT_ACCOUNT]: {
            type: 'string',
            maxLength: 29,
            minLength: 20,
            pattern: LETTERS_AND_DIGITS_VALIDATION_PATTERN,
        },
        [colsCompanies.POST_ADDRESS]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [colsCompanies.BANK_NAME]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [colsCompanies.HEAD_COMPANY_FULL_NAME]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [colsCompanies.BANK_COUNTRY_ID]: {
            type: 'string',
            format: 'uuid',
        },
        [colsCompanies.BANK_ADDRESS]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [colsCompanies.BANK_CODE]: {
            type: 'string',
            maxLength: 9,
            minLength: 6,
            pattern: DIGITS_VALIDATION_PATTERN,
        },
        [colsCompanies.CONTRACT_SIGNER_FULL_NAME]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
    },
    required: [
        colsCompanies.LEGAL_CITY_COORDINATES,
        colsCompanies.LEGAL_ADDRESS,
        colsCompanies.SETTLEMENT_ACCOUNT,
        colsCompanies.POST_ADDRESS,
        colsCompanies.BANK_NAME,
        colsCompanies.HEAD_COMPANY_FULL_NAME,
        colsCompanies.BANK_COUNTRY_ID,
        colsCompanies.BANK_ADDRESS,
        colsCompanies.BANK_CODE,
        colsCompanies.CONTRACT_SIGNER_FULL_NAME,
    ],
    additionalProperties: false,
};

const finishRegistrationStep2TransporterAsyncFunc = ({ userId, companyId }) => ({
    $async: true,
    properties: {
        [colsCompanies.SETTLEMENT_ACCOUNT]: {
            company_with_settlement_account_exists: {
                userId,
                companyId,
            },
        },
        [colsCompanies.BANK_COUNTRY_ID]: {
            country_not_exist: {},
        },
    },
    additionalProperties: true,
});

const finishRegistrationStep2Holder = {
    properties: {
        [colsCompanies.LEGAL_CITY_COORDINATES]: coordinatesFormat,
        [colsCompanies.LEGAL_ADDRESS]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [colsCompanies.SETTLEMENT_ACCOUNT]: {
            type: 'string',
            maxLength: 29,
            minLength: 20,
            pattern: LETTERS_AND_DIGITS_VALIDATION_PATTERN,
        },
        [colsCompanies.POST_ADDRESS]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [colsCompanies.BANK_NAME]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [colsCompanies.HEAD_COMPANY_FULL_NAME]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [colsCompanies.BANK_COUNTRY_ID]: {
            type: 'string',
            format: 'uuid',
        },
        [colsCompanies.BANK_ADDRESS]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [colsCompanies.BANK_CODE]: {
            type: 'string',
            maxLength: 9,
            minLength: 6,
            pattern: DIGITS_VALIDATION_PATTERN,
        },
        [colsCompanies.CONTRACT_SIGNER_FULL_NAME]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
    },
    required: [
        colsCompanies.LEGAL_CITY_COORDINATES,
        colsCompanies.LEGAL_ADDRESS,
        colsCompanies.SETTLEMENT_ACCOUNT,
        colsCompanies.POST_ADDRESS,
        colsCompanies.BANK_NAME,
        colsCompanies.HEAD_COMPANY_FULL_NAME,
        colsCompanies.BANK_COUNTRY_ID,
        colsCompanies.BANK_ADDRESS,
        colsCompanies.BANK_CODE,
        colsCompanies.CONTRACT_SIGNER_FULL_NAME,
    ],
    additionalProperties: false,
};

const finishRegistrationStep2HolderAsyncFunc = ({ userId, companyId }) => ({
    $async: true,
    properties: {
        [colsCompanies.SETTLEMENT_ACCOUNT]: {
            company_with_settlement_account_exists: {
                userId,
                companyId,
            },
        },
        [colsCompanies.BANK_COUNTRY_ID]: {
            country_not_exist: {},
        },
    },
    additionalProperties: true,
});

const finishRegistrationStep2SoleProprietorForwarder = {
    properties: {
        [colsCompanies.LEGAL_CITY_COORDINATES]: coordinatesFormat,
        [colsCompanies.LEGAL_ADDRESS]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [colsCompanies.SETTLEMENT_ACCOUNT]: {
            type: 'string',
            maxLength: 29,
            minLength: 20,
            pattern: LETTERS_AND_DIGITS_VALIDATION_PATTERN,
        },
        [colsCompanies.POST_ADDRESS]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [colsCompanies.BANK_NAME]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [colsCompanies.BANK_COUNTRY_ID]: {
            type: 'string',
            format: 'uuid',
        },
        [colsCompanies.BANK_ADDRESS]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [colsCompanies.BANK_CODE]: {
            type: 'string',
            maxLength: 9,
            minLength: 6,
            pattern: DIGITS_VALIDATION_PATTERN,
        },
    },
    required: [
        colsCompanies.LEGAL_CITY_COORDINATES,
        colsCompanies.LEGAL_ADDRESS,
        colsCompanies.SETTLEMENT_ACCOUNT,
        colsCompanies.POST_ADDRESS,
        colsCompanies.BANK_NAME,
        colsCompanies.BANK_COUNTRY_ID,
        colsCompanies.BANK_ADDRESS,
        colsCompanies.BANK_CODE,
    ],
    additionalProperties: false,
};

const finishRegistrationStep2SoleProprietorForwarderAsyncFunc = ({ userId, companyId }) => ({
    $async: true,
    properties: {
        [colsCompanies.SETTLEMENT_ACCOUNT]: {
            company_with_settlement_account_exists: {
                userId,
                companyId,
            },
        },
        [colsCompanies.BANK_COUNTRY_ID]: {
            country_not_exist: {},
        },
    },
    additionalProperties: true,
});

const settlementAccountAsync = {
    $async: true,
    properties: {
        [colsCompanies.SETTLEMENT_ACCOUNT]: {
            not_valid_settlement_account: {},
        },

    },
    errorMessage: {
        properties: {
            [colsCompanies.SETTLEMENT_ACCOUNT]: 'invalid for selected country',
        },
    },
    additionalProperties: true,
};

const finishRegistrationStep3Transporter = {
    properties: {
        [colsCompanies.STATE_REGISTRATION_CERTIFICATE_NUMBER]: {
            type: 'string',
        },
        [colsCompanies.STATE_REGISTRATION_CERTIFICATE_CREATED_AT]: {
            type: 'string',
            format: 'date',
        },
        [colsCompanies.INSURANCE_POLICY_NUMBER]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
            pattern: LETTERS_AND_DIGITS_VALIDATION_PATTERN,
        },
        [colsCompanies.INSURANCE_POLICY_CREATED_AT]: {
            type: 'string',
            format: 'date',
        },
        [colsCompanies.INSURANCE_POLICY_EXPIRED_AT]: {
            type: 'string',
            format: 'date',
        },
        [colsCompanies.INSURANCE_COMPANY_NAME]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [HOMELESS_COLUMNS.OTHER_ORGANIZATIONS]: otherOrganizations,
        [colsCompanies.RESIDENCY_CERTIFICATE_CREATED_AT]: {
            type: 'string',
            format: 'date',
        },
        [colsCompanies.RESIDENCY_CERTIFICATE_EXPIRED_AT]: {
            type: 'string',
            format: 'date',
        },
        dependencies: {
            [colsCompanies.RESIDENCY_CERTIFICATE_CREATED_AT]: {
                required: [colsCompanies.RESIDENCY_CERTIFICATE_EXPIRED_AT],
            },
            [colsCompanies.RESIDENCY_CERTIFICATE_EXPIRED_AT]: {
                required: [colsCompanies.RESIDENCY_CERTIFICATE_CREATED_AT],
            },
        },
    },
    required: [
        colsCompanies.STATE_REGISTRATION_CERTIFICATE_NUMBER,
        colsCompanies.STATE_REGISTRATION_CERTIFICATE_CREATED_AT,
        colsCompanies.INSURANCE_POLICY_NUMBER,
        colsCompanies.INSURANCE_POLICY_CREATED_AT,
        colsCompanies.INSURANCE_POLICY_EXPIRED_AT,
        colsCompanies.INSURANCE_COMPANY_NAME,
    ],
    additionalProperties: false,
};

const finishRegistrationStep3TransporterAsyncFunc = ({ companyId, userId }) => ({
    $async: true,
    properties: {
        [colsCompanies.STATE_REGISTRATION_CERTIFICATE_NUMBER]: {
            state_registration_certificate_number_exists: {
                companyId,
                userId,
            },
        },
    },
    additionalProperties: true,
});

const finishRegistrationStep3TransporterFiles = {
    patternProperties: {
        '.': fileFormat,
    },
    required: [DOCUMENTS.STATE_REGISTRATION_CERTIFICATE, DOCUMENTS.INSURANCE_POLICY],
};

const finishRegistrationStep3Holder = {
    properties: {
        [colsCompanies.STATE_REGISTRATION_CERTIFICATE_NUMBER]: {
            type: 'string',
        },
        [colsCompanies.STATE_REGISTRATION_CERTIFICATE_CREATED_AT]: {
            type: 'string',
            format: 'date',
        },
        [HOMELESS_COLUMNS.OTHER_ORGANIZATIONS]: otherOrganizations,
        [colsCompanies.RESIDENCY_CERTIFICATE_CREATED_AT]: {
            type: 'string',
            format: 'date',
        },
        [colsCompanies.RESIDENCY_CERTIFICATE_EXPIRED_AT]: {
            type: 'string',
            format: 'date',
        },
        dependencies: {
            [colsCompanies.RESIDENCY_CERTIFICATE_CREATED_AT]: {
                required: [colsCompanies.RESIDENCY_CERTIFICATE_EXPIRED_AT],
            },
            [colsCompanies.RESIDENCY_CERTIFICATE_EXPIRED_AT]: {
                required: [colsCompanies.RESIDENCY_CERTIFICATE_CREATED_AT],
            },
        },
    },
    required: [
        colsCompanies.STATE_REGISTRATION_CERTIFICATE_NUMBER,
        colsCompanies.STATE_REGISTRATION_CERTIFICATE_CREATED_AT,
    ],
    additionalProperties: false,
};

const finishRegistrationStep3HolderAsyncFunc = ({ companyId, userId }) => ({
    $async: true,
    properties: {
        [colsCompanies.STATE_REGISTRATION_CERTIFICATE_NUMBER]: {
            state_registration_certificate_number_exists: {
                companyId,
                userId,
            },
        },
    },
    additionalProperties: true,
});

const finishRegistrationStep3HolderFiles = {
    patternProperties: {
        '.': fileFormat,
    },
    required: [DOCUMENTS.STATE_REGISTRATION_CERTIFICATE],
};

const finishRegistrationStep3IndividualForwarder = {
    properties: {
        [colsUsers.PASSPORT_NUMBER]: {
            type: 'string',
            pattern: LETTERS_AND_DIGITS_VALIDATION_PATTERN,
            maxLength: 19,
        },
        [colsUsers.PASSPORT_ISSUING_AUTHORITY]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [colsUsers.PASSPORT_CREATED_AT]: {
            type: 'string',
            format: 'date',
        },
        [colsUsers.PASSPORT_EXPIRED_AT]: {
            type: 'string',
            format: 'date',
        },
    },
    required: [
        colsUsers.PASSPORT_NUMBER,
        colsUsers.PASSPORT_ISSUING_AUTHORITY,
        colsUsers.PASSPORT_CREATED_AT,
        colsUsers.PASSPORT_EXPIRED_AT,
    ],
    additionalProperties: false,
};

const finishRegistrationStep3IndividualForwarderAsyncFunc = ({ companyId, userId }) => ({
    $async: true,
    properties: {
        [colsUsers.PASSPORT_NUMBER]: {
            passport_number_exists: {
                companyId,
                userId,
            },
        },
    },
    additionalProperties: true,
});

const finishRegistrationStep3IndividualForwarderFiles = {
    patternProperties: {
        '.': fileFormat,
    },
    required: [DOCUMENTS.PASSPORT],
};

const finishRegistrationStep3SoleProprietorForwarder = {
    properties: {
        [colsCompanies.STATE_REGISTRATION_CERTIFICATE_NUMBER]: {
            type: 'string',
        },
        [colsCompanies.STATE_REGISTRATION_CERTIFICATE_CREATED_AT]: {
            type: 'string',
            format: 'date',
        },
        [colsUsers.PASSPORT_NUMBER]: {
            type: 'string',
            pattern: LETTERS_AND_DIGITS_VALIDATION_PATTERN,
            maxLength: 19,
        },
        [colsUsers.PASSPORT_ISSUING_AUTHORITY]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [colsUsers.PASSPORT_CREATED_AT]: {
            type: 'string',
            format: 'date',
        },
        [colsUsers.PASSPORT_EXPIRED_AT]: {
            type: 'string',
            format: 'date',
        },
    },
    required: [
        colsCompanies.STATE_REGISTRATION_CERTIFICATE_NUMBER,
        colsCompanies.STATE_REGISTRATION_CERTIFICATE_CREATED_AT,
        colsUsers.PASSPORT_NUMBER,
        colsUsers.PASSPORT_ISSUING_AUTHORITY,
        colsUsers.PASSPORT_CREATED_AT,
        colsUsers.PASSPORT_EXPIRED_AT,
    ],
    additionalProperties: false,
};

const finishRegistrationStep3SoleProprietorForwarderAsyncFunc = ({ companyId, userId }) => ({
    $async: true,
    properties: {
        [colsCompanies.STATE_REGISTRATION_CERTIFICATE_NUMBER]: {
            state_registration_certificate_number_exists: {
                companyId,
                userId,
            },
        },
        [colsUsers.PASSPORT_NUMBER]: {
            passport_number_exists: {
                companyId,
                userId,
            },
        },
    },
    additionalProperties: true,
});

const finishRegistrationStep3SoleProprietorForwarderFiles = {
    patternProperties: {
        '.': fileFormat,
    },
    required: [DOCUMENTS.PASSPORT, DOCUMENTS.STATE_REGISTRATION_CERTIFICATE],
};

const finishRegistrationStep4 = {
    properties: {
        [HOMELESS_COLUMNS.ROUTES]: {
            type: 'array',
            items: [
                {
                    properties: {
                        [colsRoutes.COORDINATES_FROM]: coordinatesFormat,
                        [colsRoutes.COORDINATES_TO]: coordinatesFormat,
                    },
                    required: [colsRoutes.COORDINATES_FROM, colsRoutes.COORDINATES_TO],
                },
            ],
            uniqueItems: true,
        }
    },
    required: [
        HOMELESS_COLUMNS.ROUTES,
    ],
    additionalProperties: false,
};

module.exports = {
    finishRegistrationStep1Transporter,
    finishRegistrationStep1TransporterAsyncFunc,
    finishRegistrationStep1Holder,
    finishRegistrationStep1HolderAsyncFunc,
    finishRegistrationStep1IndividualForwarder,
    finishRegistrationStep1IndividualForwarderAsyncFunc,
    finishRegistrationStep1SoleProprietorForwarder,
    finishRegistrationStep1SoleProprietorForwarderAsyncFunc,

    finishRegistrationStep2Transporter,
    finishRegistrationStep2TransporterAsyncFunc,
    finishRegistrationStep2Holder,
    finishRegistrationStep2HolderAsyncFunc,
    finishRegistrationStep2SoleProprietorForwarder,
    finishRegistrationStep2SoleProprietorForwarderAsyncFunc,

    settlementAccountAsync,

    finishRegistrationStep3Transporter,
    finishRegistrationStep3TransporterAsyncFunc,
    finishRegistrationStep3TransporterFiles,

    finishRegistrationStep3Holder,
    finishRegistrationStep3HolderAsyncFunc,
    finishRegistrationStep3HolderFiles,

    finishRegistrationStep3IndividualForwarder,
    finishRegistrationStep3IndividualForwarderAsyncFunc,
    finishRegistrationStep3IndividualForwarderFiles,

    finishRegistrationStep3SoleProprietorForwarder,
    finishRegistrationStep3SoleProprietorForwarderAsyncFunc,
    finishRegistrationStep3SoleProprietorForwarderFiles,

    finishRegistrationStep4,
};
