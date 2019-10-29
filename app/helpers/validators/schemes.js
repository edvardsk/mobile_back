
// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { DOCUMENTS } = require('constants/files');
const { ROLES } = require('constants/system');
const {
    PAGINATION_PARAMS,
    SORTING_PARAMS,
    SORTING_DIRECTIONS,
    COMPANY_EMPLOYEES_SORT_COLUMNS,
} = require('constants/pagination-sorting');

const colsUsers = SQL_TABLES.USERS.COLUMNS;
const colsCompanies = SQL_TABLES.COMPANIES.COLUMNS;
const colsPhoneConfirmation = SQL_TABLES.PHONE_CONFIRMATION_CODES.COLUMNS;
const colsOtherOrganizations = SQL_TABLES.OTHER_ORGANIZATIONS.COLUMNS;
const colsRoutes = SQL_TABLES.ROUTES.COLUMNS;

const DIGITS_VALIDATION_PATTERN = '^\\d+$';
const PASSWORD_VALIDATION_PATTERN = '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,}$';
const URL_VALIDATION_PATTERN = '^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&\'\\(\\)\\*\\+,;=.]+$';
const LETTERS_AND_DIGITS_VALIDATION_PATTERN = '^[a-zA-Z0-9]*$';
// const STATE_REGISTRATION_CERTIFICATE_NUMBER_VALIDATION_PATTERN = '^[A-Z]{2}.[0-9]{2}.[0-9]{2}.[0-9]{2}.[0-9]{3}.[A-Z]{1}.[0-9]{6}.[0-9]{2}.[0-9]{2}$';
const DOUBLE_NUMBER_VALIDATION_PATTERN = '^-?[0-9]+\\.[0-9]+$';

const SUPPORTED_MIMTYPES = ['application/pdf', 'image/jpeg'];

const POSTGRES_MAX_STRING_LENGTH = 255;

// helpers
const fileFormat = {
    type: 'array',
    items: [
        {
            properties: {
                fieldname: {
                    type: 'string',
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
    ],
};

const requiredUserId = {
    properties: {
        userId: {
            type: 'string',
            format: 'uuid',
        },
    },
    required: [
        'userId',
    ]
};

const requiredExistingUserWithIdAsync = {
    $async: true,
    properties: {
        userId: {
            user_with_id_not_exist: {},
        },
    },
};

const otherOrganizations = {
    type: 'array',
    items: [
        {
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
    ],
    minItems: 1,
    uniqueItems: true,
};
// helpers

const registration = {
    properties: {
        [colsUsers.EMAIL]: {
            type: 'string',
            format: 'email',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [colsUsers.PASSWORD]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
            pattern: PASSWORD_VALIDATION_PATTERN,
        },
        [colsUsers.FULL_NAME]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [HOMELESS_COLUMNS.ROLE_ID]: {
            type: 'string',
            format: 'uuid',
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
        colsUsers.EMAIL,
        colsUsers.PASSWORD,
        colsUsers.FULL_NAME,
        HOMELESS_COLUMNS.ROLE_ID,
        HOMELESS_COLUMNS.PHONE_NUMBER,
        HOMELESS_COLUMNS.PHONE_PREFIX_ID,
    ],
    additionalProperties: false,
};

const registrationAsync = {
    $async: true,
    properties: {
        [colsUsers.EMAIL]: {
            email_exists: {},
        },
        [HOMELESS_COLUMNS.ROLE_ID]: {
            role_not_exist: {},
        },
        [HOMELESS_COLUMNS.PHONE_PREFIX_ID]: {
            phone_prefix_not_exist: {},
        },
        [HOMELESS_COLUMNS.PHONE_NUMBER]: {
            phone_number_exists: {},
        },
    },
    required: [
        colsUsers.EMAIL,
        HOMELESS_COLUMNS.ROLE_ID,
        HOMELESS_COLUMNS.PHONE_PREFIX_ID,
        HOMELESS_COLUMNS.PHONE_NUMBER,
    ],
    additionalProperties: true,
};

const phoneNumberWithPrefixAsync = {
    $async: true,
    properties: {
        [HOMELESS_COLUMNS.PHONE_NUMBER]: {
            phone_number_not_valid: {},
        },
    },
    required: [
        HOMELESS_COLUMNS.PHONE_PREFIX_ID,
        HOMELESS_COLUMNS.PHONE_NUMBER,
    ],
    additionalProperties: true,
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
    additionalProperties: false,
};

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

const finishRegistrationStep1TransporterAsyncFunc = userId => ({
    $async: true,
    properties: {
        [colsCompanies.COUNTRY_ID]: {
            country_not_exist: {},
        },
        [colsCompanies.IDENTITY_NUMBER]: {
            company_with_identity_number_exists: {
                userId,
            },
        },
        [colsCompanies.NAME]: {
            company_with_name_exists: {
                userId,
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

const finishRegistrationStep1HolderAsyncFunc = userId => ({
    $async: true,
    properties: {
        [colsCompanies.COUNTRY_ID]: {
            country_not_exist: {},
        },
        [colsCompanies.IDENTITY_NUMBER]: {
            company_with_identity_number_exists: {
                userId,
            },
        },
        [colsCompanies.NAME]: {
            company_with_name_exists: {
                userId,
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
        colsCompanies.COUNTRY_ID,
        colsCompanies.IDENTITY_NUMBER,
    ],
    additionalProperties: false,
};

const finishRegistrationStep1IndividualForwarderAsyncFunc = userId => ({
    $async: true,
    properties: {
        [colsCompanies.COUNTRY_ID]: {
            country_not_exist: {},
        },
        [colsCompanies.IDENTITY_NUMBER]: {
            company_with_identity_number_exists: {
                userId,
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

const finishRegistrationStep1SoleProprietorForwarderAsyncFunc = userId => ({
    $async: true,
    properties: {
        [colsCompanies.COUNTRY_ID]: {
            country_not_exist: {},
        },
        [colsCompanies.IDENTITY_NUMBER]: {
            company_with_identity_number_exists: {
                userId,
            },
        },
    },
    additionalProperties: true,
});

const finishRegistrationStep2Transporter = {
    properties: {
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
        colsCompanies.LEGAL_ADDRESS,
        colsCompanies.SETTLEMENT_ACCOUNT,
        colsCompanies.POST_ADDRESS,
        colsCompanies.BANK_NAME,
        colsCompanies.HEAD_COMPANY_FULL_NAME,
        colsCompanies.BANK_ADDRESS,
        colsCompanies.BANK_CODE,
        colsCompanies.CONTRACT_SIGNER_FULL_NAME,
    ],
    additionalProperties: false,
};

const finishRegistrationStep2TransporterAsyncFunc = userId => ({
    $async: true,
    properties: {
        [colsCompanies.SETTLEMENT_ACCOUNT]: {
            company_with_settlement_account_exists: {
                userId,
            },
        },
    },
    additionalProperties: true,
});

const finishRegistrationStep2Holder = {
    properties: {
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
        colsCompanies.LEGAL_ADDRESS,
        colsCompanies.SETTLEMENT_ACCOUNT,
        colsCompanies.POST_ADDRESS,
        colsCompanies.BANK_NAME,
        colsCompanies.HEAD_COMPANY_FULL_NAME,
        colsCompanies.BANK_ADDRESS,
        colsCompanies.BANK_CODE,
        colsCompanies.CONTRACT_SIGNER_FULL_NAME,
    ],
    additionalProperties: false,
};

const finishRegistrationStep2HolderAsyncFunc = userId => ({
    $async: true,
    properties: {
        [colsCompanies.SETTLEMENT_ACCOUNT]: {
            company_with_settlement_account_exists: {
                userId,
            },
        },
    },
    additionalProperties: true,
});

const finishRegistrationStep2SoleProprietorForwarder = {
    properties: {
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
        colsCompanies.LEGAL_ADDRESS,
        colsCompanies.SETTLEMENT_ACCOUNT,
        colsCompanies.POST_ADDRESS,
        colsCompanies.BANK_NAME,
        colsCompanies.BANK_ADDRESS,
        colsCompanies.BANK_CODE,
    ],
    additionalProperties: false,
};

const finishRegistrationStep2SoleProprietorForwarderAsyncFunc = userId => ({
    $async: true,
    properties: {
        [colsCompanies.SETTLEMENT_ACCOUNT]: {
            company_with_settlement_account_exists: {
                userId,
            },
        },
    },
    additionalProperties: true,
});

const modifyOtherOrganizations = {
    properties: {
        [HOMELESS_COLUMNS.OTHER_ORGANIZATIONS]: {
            parse_string_to_json: {},
        },
    },
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

const finishRegistrationStep3TransporterAsyncFunc = userId => ({
    $async: true,
    properties: {
        [colsCompanies.STATE_REGISTRATION_CERTIFICATE_NUMBER]: {
            state_registration_certificate_number_exists: {
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

const finishRegistrationStep3HolderAsyncFunc = userId => ({
    $async: true,
    properties: {
        [colsCompanies.STATE_REGISTRATION_CERTIFICATE_NUMBER]: {
            state_registration_certificate_number_exists: {
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

const finishRegistrationStep3IndividualForwarderAsyncFunc = userId => ({
    $async: true,
    properties: {
        [colsUsers.PASSPORT_NUMBER]: {
            passport_number_exists: {
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

const finishRegistrationStep3SoleProprietorForwarderAsyncFunc = userId => ({
    $async: true,
    properties: {
        [colsCompanies.STATE_REGISTRATION_CERTIFICATE_NUMBER]: {
            state_registration_certificate_number_exists: {
                userId,
            },
        },
        [colsUsers.PASSPORT_NUMBER]: {
            passport_number_exists: {
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
                        [colsRoutes.COORDINATES_FROM]: {
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
                        },
                        [colsRoutes.COORDINATES_TO]: {
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
                        },
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

const inviteUser = {
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
    },
    required: [
        colsUsers.EMAIL,
        colsUsers.FULL_NAME,
        HOMELESS_COLUMNS.PHONE_PREFIX_ID,
        HOMELESS_COLUMNS.PHONE_NUMBER,
    ],
    additionalProperties: false,
};

const inviteUserAsync = {
    $async: true,
    properties: {
        [colsUsers.EMAIL]: {
            email_exists: {},
        },
        [HOMELESS_COLUMNS.PHONE_PREFIX_ID]: {
            phone_prefix_not_exist: {},
        },
        [HOMELESS_COLUMNS.PHONE_NUMBER]: {
            phone_number_exists: {},
        },
    },
    additionalProperties: true,
};

const requiredPassword = {
    properties: {
        [colsUsers.PASSWORD]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
            pattern: PASSWORD_VALIDATION_PATTERN,
        },
    },
    required: [
        colsUsers.PASSWORD,
    ],
    additionalProperties: false,
};

const requiredEmail = {
    properties: {
        [colsUsers.EMAIL]: {
            type: 'string',
            format: 'email',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
    },
    required: [
        colsUsers.EMAIL,
    ],
    additionalProperties: false,
};

const requiredEmailAsync = {
    $async: true,
    properties: {
        [colsUsers.EMAIL]: {
            email_not_exists: {},
        },
    },
    required: [
        colsUsers.EMAIL,
    ],
    additionalProperties: false,
};

const inviteUserRolesParams = {
    properties: {
        role: {
            type: 'string',
            enum: [ROLES.MANAGER, ROLES.DISPATCHER, ROLES.LOGISTICIAN],
        },
    },
    required: [
        'role'
    ],
};

const requiredMeParams = {
    properties: {
        me: {
            type: 'string',
            enum: ['me'],
        },
    },
    required: [
        'me'
    ],
};

const basePaginationQuery = {
    properties: {
        [PAGINATION_PARAMS.PAGE]: {
            type: 'string',
            pattern: DIGITS_VALIDATION_PATTERN,
        },
        [PAGINATION_PARAMS.LIMIT]: {
            type: 'string',
            pattern: DIGITS_VALIDATION_PATTERN,
        },
    },
};

const basePaginationModifyQuery = {
    properties: {
        [PAGINATION_PARAMS.PAGE]: {
            parse_pagination_options: {},
        },
        [PAGINATION_PARAMS.LIMIT]: {
            parse_pagination_options: {},
        },
    },
};

const baseSortingSortingDirectionQuery = {
    properties: {
        [SORTING_PARAMS.SORT_DIRECTION]: {
            type: 'string',
            enum: [SORTING_DIRECTIONS.ASC, SORTING_DIRECTIONS.DESC],
        },
    },
};

const companyEmployeesSortColumnQuery = {
    properties: {
        [SORTING_PARAMS.SORT_COLUMN]: {
            type: 'string',
            enum: COMPANY_EMPLOYEES_SORT_COLUMNS,
        }
    }
};

const modifyCompanyEmployeesFilterQuery = {
    properties: {
        [HOMELESS_COLUMNS.FILTER]: {
            parse_string_to_json: {},
        },
    },
};

const companyEmployeesFilterQuery = {
    properties: {
        [HOMELESS_COLUMNS.FILTER]: {
            type: 'object',
            properties: {
                [colsUsers.FULL_NAME]: {
                    type: 'string',
                },
            },
            additionalProperties: false,
        },
    },
};

module.exports = {
    requiredUserId,
    requiredExistingUserWithIdAsync,

    registration,
    registrationAsync,

    phoneNumberWithPrefixAsync,

    authorization,

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

    confirmPhoneNumber,
    otherOrganizations,

    inviteUser,
    inviteUserAsync,

    requiredPassword,
    requiredEmail,
    requiredEmailAsync,

    modifyOtherOrganizations,
    inviteUserRolesParams,
    requiredMeParams,

    basePaginationQuery,
    basePaginationModifyQuery,
    baseSortingSortingDirectionQuery,
    companyEmployeesSortColumnQuery,
    modifyCompanyEmployeesFilterQuery,
    companyEmployeesFilterQuery,
};
