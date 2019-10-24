
// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { DOCUMENTS } = require('constants/files');

const colsUsers = SQL_TABLES.USERS.COLUMNS;
const colsCompanies = SQL_TABLES.COMPANIES.COLUMNS;
const colsPhoneConfirmation = SQL_TABLES.PHONE_CONFIRMATION_CODES.COLUMNS;
const colsOtherOrganizations = SQL_TABLES.OTHER_ORGANIZATIONS.COLUMNS;
const colsRoutes = SQL_TABLES.ROUTES.COLUMNS;

const DIGITS_VALIDATION_PATTERN = '^\\d+$';
const PASSWORD_VALIDATION_PATTERN = '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,}$';
const URL_VALIDATION_PATTERN = '^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&\'\\(\\)\\*\\+,;=.]+$';
const LETTERS_AND_DIGITS_VALIDATION_PATTERN = '^[a-zA-Z0-9]*$';
const STATE_REGISTRATION_CERTIFICATE_NUMBER_VALIDATION_PATTERN = '^[A-Z]{2}.[0-9]{2}.[0-9]{2}.[0-9]{2}.[0-9]{3}.[A-Z]{1}.[0-9]{6}.[0-9]{2}.[0-9]{2}$';
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
    uniqueItems: true,
};
// helpers

const registration = {
    $async: true,
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
            phoneNumberExists: {},
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
    additionalProperties: false,
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

const finishRegistrationStep1TransporterFunc = userId => ({
    $async: true,
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
            countryExists: {},
        },
        [colsCompanies.IDENTITY_NUMBER]: {
            type: 'string',
            minLength: 9,
            maxLength: 12,
            companyWithIdentityNumberExists: {
                userId,
            },
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
});

const finishRegistrationStep1HolderFunc = userId => ({
    $async: true,
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
            countryExists: {},
        },
        [colsCompanies.IDENTITY_NUMBER]: {
            type: 'string',
            minLength: 9,
            maxLength: 12,
            companyWithIdentityNumberExists: {
                userId,
            },
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
});

const finishRegistrationStep1IndividualForwarderFunc = userId => ({
    $async: true,
    properties: {
        [colsCompanies.COUNTRY_ID]: {
            type: 'string',
            format: 'uuid',
            countryExists: {},
        },
        [colsCompanies.IDENTITY_NUMBER]: {
            type: 'string',
            minLength: 9,
            maxLength: 12,
            companyWithIdentityNumberExists: {
                userId,
            },
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
});

const finishRegistrationStep1SoleProprietorForwarderFunc = userId => ({
    $async: true,
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
            countryExists: {},
        },
        [colsCompanies.IDENTITY_NUMBER]: {
            type: 'string',
            minLength: 9,
            maxLength: 12,
            companyWithIdentityNumberExists: {
                userId,
            },
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
});

const finishRegistrationStep2TransporterFunc = userId => ({
    $async: true,
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
            companyWithSettlementAccountExists: {
                userId,
            },
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
});

const finishRegistrationStep2HolderFunc = userId => ({
    $async: true,
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
            companyWithSettlementAccountExists: {
                userId,
            },
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
});

const finishRegistrationStep2SoleProprietorForwarderFunc = userId => ({
    $async: true,
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
            companyWithSettlementAccountExists: {
                userId,
            },
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
});

const finishRegistrationStep3TransporterFunc = userId => ({
    $async: true,
    properties: {
        [colsCompanies.STATE_REGISTRATION_CERTIFICATE_NUMBER]: {
            type: 'string',
            pattern: STATE_REGISTRATION_CERTIFICATE_NUMBER_VALIDATION_PATTERN,
            stateRegistrationCertificateNumberExists: {
                userId,
            },
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
        [HOMELESS_COLUMNS.OTHER_ORGANIZATIONS]: {
            type: 'string',
        },
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
});

const finishRegistrationStep3TransporterFiles = {
    patternProperties: {
        '.': fileFormat,
    },
    required: [DOCUMENTS.STATE_REGISTRATION_CERTIFICATE, DOCUMENTS.INSURANCE_POLICY],
};

const finishRegistrationStep3HolderFunc = userId => ({
    $async: true,
    properties: {
        [colsCompanies.STATE_REGISTRATION_CERTIFICATE_NUMBER]: {
            type: 'string',
            pattern: STATE_REGISTRATION_CERTIFICATE_NUMBER_VALIDATION_PATTERN,
            stateRegistrationCertificateNumberExists: {
                userId,
            },
        },
        [colsCompanies.STATE_REGISTRATION_CERTIFICATE_CREATED_AT]: {
            type: 'string',
            format: 'date',
        },
        [HOMELESS_COLUMNS.OTHER_ORGANIZATIONS]: {
            type: 'string',
        },
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
});

const finishRegistrationStep3Holder = {
    patternProperties: {
        '.': fileFormat,
    },
    required: [DOCUMENTS.STATE_REGISTRATION_CERTIFICATE],
};

const finishRegistrationStep3IndividualForwarderFunc = userId => ({
    $async: true,
    properties: {
        [colsUsers.PASSPORT_NUMBER]: {
            type: 'string',
            pattern: LETTERS_AND_DIGITS_VALIDATION_PATTERN,
            maxLength: 19,
            passportNumberExists: {
                userId,
            },
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
});

const finishRegistrationStep3IndividualForwarder = {
    patternProperties: {
        '.': fileFormat,
    },
    required: [DOCUMENTS.PASSPORT],
};

const finishRegistrationStep3SoleProprietorForwarderFunc = userId => ({
    $async: true,
    properties: {
        [colsCompanies.STATE_REGISTRATION_CERTIFICATE_NUMBER]: {
            type: 'string',
            pattern: STATE_REGISTRATION_CERTIFICATE_NUMBER_VALIDATION_PATTERN,
            stateRegistrationCertificateNumberExists: {
                userId,
            },
        },
        [colsCompanies.STATE_REGISTRATION_CERTIFICATE_CREATED_AT]: {
            type: 'string',
            format: 'date',
        },
        [colsUsers.PASSPORT_NUMBER]: {
            type: 'string',
            pattern: LETTERS_AND_DIGITS_VALIDATION_PATTERN,
            maxLength: 19,
            passportNumberExists: {
                userId,
            },
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
});

const finishRegistrationStep3SoleProprietorForwarder = {
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

const inviteManager = {
    $async: true,
    properties: {
        [colsUsers.EMAIL]: {
            type: 'string',
            format: 'email',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
            emailExists: {},
        },
        [colsUsers.FULL_NAME]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [HOMELESS_COLUMNS.PHONE_PREFIX_ID]: {
            type: 'string',
            format: 'uuid',
            phonePrefixExists: {},
        },
        [HOMELESS_COLUMNS.PHONE_NUMBER]: {
            type: 'string',
            pattern: DIGITS_VALIDATION_PATTERN,
            phoneNumberExists: {},
            phoneNumberValid: {},
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

module.exports = {
    registration,
    authorization,

    finishRegistrationStep1TransporterFunc,
    finishRegistrationStep1HolderFunc,
    finishRegistrationStep1IndividualForwarderFunc,
    finishRegistrationStep1SoleProprietorForwarderFunc,

    finishRegistrationStep2TransporterFunc,
    finishRegistrationStep2HolderFunc,
    finishRegistrationStep2SoleProprietorForwarderFunc,

    finishRegistrationStep3TransporterFunc,
    finishRegistrationStep3TransporterFiles,

    finishRegistrationStep3HolderFunc,
    finishRegistrationStep3Holder,

    finishRegistrationStep3IndividualForwarderFunc,
    finishRegistrationStep3IndividualForwarder,

    finishRegistrationStep3SoleProprietorForwarderFunc,
    finishRegistrationStep3SoleProprietorForwarder,

    finishRegistrationStep4,

    confirmPhoneNumber,
    otherOrganizations,

    inviteManager,

    requiredPassword,
};
