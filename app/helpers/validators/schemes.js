
// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { DOCUMENTS, FILES_GROUPS } = require('constants/files');
const { ROLES, ARRAY_ROLES_WITHOUT_ADMIN } = require('constants/system');
const {
    PAGINATION_PARAMS,
    SORTING_PARAMS,
    SORTING_DIRECTIONS,
    COMPANY_EMPLOYEES_SORT_COLUMNS,
    COMPANIES_SORT_COLUMNS,
    USERS_SORT_COLUMNS,
} = require('constants/pagination-sorting');
const {
    LOADING_METHODS_MAP,
    LOADING_TYPES_MAP,
    GUARANTEES_MAP,
} = require('constants/cargos');

const { CARGO_STATUSES } = require('constants/cargo-statuses');

const colsUsers = SQL_TABLES.USERS.COLUMNS;
const colsCompanies = SQL_TABLES.COMPANIES.COLUMNS;
const colsPhoneConfirmation = SQL_TABLES.PHONE_CONFIRMATION_CODES.COLUMNS;
const colsOtherOrganizations = SQL_TABLES.OTHER_ORGANIZATIONS.COLUMNS;
const colsRoutes = SQL_TABLES.ROUTES.COLUMNS;
const colsDrivers = SQL_TABLES.DRIVERS.COLUMNS;
const colsCargos = SQL_TABLES.CARGOS.COLUMNS;
const colsEconomicSettings = SQL_TABLES.ECONOMIC_SETTINGS.COLUMNS;

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
                    maxLength: POSTGRES_MAX_STRING_LENGTH,

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

const coordinatesFormat = {
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
    additionalProperties: false,
};
// helpers

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

const requiredExistingCompanyWithIdAsync = {
    $async: true,
    properties: {
        companyId: {
            company_with_id_not_exist: {},
        },
    },
};

const requiredNotExistingCompanyEconomicSettingsWithIdAsync = {
    $async: true,
    properties: {
        companyId: {
            company_economic_settings_with_id_exist: {},
        },
    },
};

const requiredExistingCompanyEconomicSettingsWithIdAsync = {
    $async: true,
    properties: {
        companyId: {
            company_economic_settings_with_id_not_exist: {},
        },
    },
};

const requiredExistingCargoInCompanyAsyncFunc = ({ companyId }) => ({
    $async: true,
    properties: {
        cargoId: {
            cargo_in_company_not_exist: {
                companyId,
            },
        },
    },
});

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
        [colsCompanies.LEGAL_CITY_NAME]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
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
        colsCompanies.LEGAL_CITY_NAME,
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
        [colsCompanies.LEGAL_CITY_NAME]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
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
        colsCompanies.LEGAL_CITY_NAME,
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
        [colsCompanies.LEGAL_CITY_NAME]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
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
        colsCompanies.LEGAL_CITY_NAME,
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

const inviteUserWithoutCompanyRolesParams = {
    properties: {
        role: {
            type: 'string',
            enum: [ROLES.MANAGER],
        },
    },
    required: [
        'role'
    ],
};

const inviteUserAdvancedFiles = {
    patternProperties: {
        '.': fileFormat,
    },
    required: [DOCUMENTS.PASSPORT, DOCUMENTS.DRIVER_LICENSE],
};

const createOrEditCargo = {
    properties: {
        [colsCargos.UPLOADING_DATE_FROM]: {
            type: 'string',
            format: 'date-time',
        },
        [colsCargos.UPLOADING_DATE_TO]: {
            type: 'string',
            format: 'date-time',
            formatMinimum: {
                '$data': `1/${colsCargos.UPLOADING_DATE_FROM}`,
            },
        },
        [colsCargos.DOWNLOADING_DATE_FROM]: {
            type: 'string',
            format: 'date-time',
            formatMinimum: {
                '$data': `1/${colsCargos.UPLOADING_DATE_FROM}`,
            },
        },
        [colsCargos.DOWNLOADING_DATE_TO]: {
            type: 'string',
            format: 'date-time',
            formatMinimum: {
                '$data': `1/${colsCargos.DOWNLOADING_DATE_FROM}`,
            },
        },
        [colsCargos.GROSS_WEIGHT]: {
            type: 'number',
            exclusiveMinimum: 0,
        },
        [colsCargos.WIDTH]: {
            type: 'number',
            exclusiveMinimum: 0,
        },
        [colsCargos.HEIGHT]: {
            type: 'number',
            exclusiveMinimum: 0,
        },
        [colsCargos.LENGTH]: {
            type: 'number',
            exclusiveMinimum: 0,
        },
        [colsCargos.LOADING_METHODS]: {
            type: 'array',
            minItems: 1,
            uniqueItems: true,
            items: {
                enum: [LOADING_METHODS_MAP.UP, LOADING_METHODS_MAP.BACK, LOADING_METHODS_MAP.SIDE],

            },
        },
        [colsCargos.LOADING_TYPE]: {
            type: 'string',
            enum: [LOADING_TYPES_MAP.FTL, LOADING_TYPES_MAP.LTL],
        },
        [colsCargos.GUARANTEES]: {
            type: 'array',
            minItems: 1,
            uniqueItems: true,
            items: {
                enum: [GUARANTEES_MAP.CMR, GUARANTEES_MAP.TIR],
            },
        },
        [colsCargos.DANGER_CLASS_ID]: {
            type: 'string',
            format: 'uuid',
        },
        [colsCargos.VEHICLE_TYPE_ID]: {
            type: 'string',
            format: 'uuid',
        },
        [colsCargos.PACKING_DESCRIPTION]: {
            type: 'string',
        },
        [colsCargos.DESCRIPTION]: {
            type: 'string',
        },
        [HOMELESS_COLUMNS.UPLOADING_POINTS]: {
            type: 'array',
            minItems: 1,
            uniqueItems: true,
            items: coordinatesFormat,
        },
        [HOMELESS_COLUMNS.DOWNLOADING_POINTS]: {
            type: 'array',
            minItems: 1,
            uniqueItems: true,
            items: coordinatesFormat
        },
    },
    required:[
        colsCargos.UPLOADING_DATE_FROM,
        colsCargos.DOWNLOADING_DATE_FROM,
        colsCargos.GROSS_WEIGHT,
        colsCargos.WIDTH,
        colsCargos.HEIGHT,
        colsCargos.LENGTH,
        colsCargos.LOADING_METHODS,
        colsCargos.LOADING_TYPE,
        colsCargos.GUARANTEES,
        colsCargos.VEHICLE_TYPE_ID,
        HOMELESS_COLUMNS.UPLOADING_POINTS,
        HOMELESS_COLUMNS.DOWNLOADING_POINTS,
    ],
    additionalProperties: false,
};

const createOrEditCargoAsync = {
    $async: true,
    properties: {
        [colsCargos.DANGER_CLASS_ID]: {
            danger_class_not_exist: {},
        },
        [colsCargos.VEHICLE_TYPE_ID]: {
            vehicle_type_not_exist: {},
        },
    },
    additionalProperties: true,
};

const createCompanyEconomicSettingsParamsAsync = {
    $async: true,
    properties: {
        companyId: {
            company_economic_settings_exists: {},
        },
    },
    additionalProperties: true,
};

const requireExistingCompanyEconomicSettingsParamsAsync = {
    $async: true,
    properties: {
        companyId: {
            company_economic_settings_not_exists: {},
        },
    },
    additionalProperties: true,
};

const createOrEditEconomicSettings = {
    properties: {
        [colsEconomicSettings.PERCENT_FROM_TRANSPORTER]: {
            type: 'number',
            minimum: 0,
            exclusiveMaximum: 100,
        },
        [colsEconomicSettings.PERCENT_TO_FORWARDER]: {
            type: 'number',
            minimum: 0,
            exclusiveMaximum: 100,
        },
        [colsEconomicSettings.PERCENT_FROM_HOLDER]: {
            type: 'number',
            minimum: 0,
            maximum: 100,
        },
    },
    required: [
        colsEconomicSettings.PERCENT_FROM_TRANSPORTER,
        colsEconomicSettings.PERCENT_TO_FORWARDER,
        colsEconomicSettings.PERCENT_FROM_HOLDER,
    ],
    additionalProperties: true,
};

const inviteUserRolesParams = {
    properties: {
        role: {
            type: 'string',
            enum: [ROLES.DISPATCHER, ROLES.LOGISTICIAN],
        },
    },
    required: [
        'role'
    ],
};

const inviteUserRolesAdvancedParams = {
    properties: {
        role: {
            type: 'string',
            enum: [ROLES.DRIVER],
        },
    },
    required: [
        'role'
    ],
};

const meOrIdRequiredMeParams = {
    properties: {
        meOrId: {
            type: 'string',
            enum: ['me'],
        },
    },
    required: [
        'meOrId'
    ],
};

const meOrIdRequiredIdParams = {
    properties: {
        meOrId: {
            type: 'string',
            format: 'uuid',
        },
    },
    required: [
        'meOrId'
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

const requiredCompanyIdParams = {
    properties: {
        companyId: {
            type: 'string',
            format: 'uuid',
        },
    },
    required: [
        'companyId'
    ],
};

const listFilesGroupParams = {
    properties: {
        fileGroup: {
            type: 'string',
            enum: [FILES_GROUPS.BASIC, FILES_GROUPS.CUSTOM],
        },
    },
    required: [
        'fileGroup'
    ]
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

const companiesSortColumnQuery = {
    properties: {
        [SORTING_PARAMS.SORT_COLUMN]: {
            type: 'string',
            enum: COMPANIES_SORT_COLUMNS,
        }
    }
};

const usersSortColumnQuery = {
    properties: {
        [SORTING_PARAMS.SORT_COLUMN]: {
            type: 'string',
            enum: USERS_SORT_COLUMNS,
        }
    }
};

const modifyFilterQuery = {
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

const usersFilterQuery = {
    properties: {
        [HOMELESS_COLUMNS.FILTER]: {
            type: 'object',
            properties: {
                [HOMELESS_COLUMNS.ROLE]: {
                    type: 'array',
                    minItems: 1,
                    uniqueItems: true,
                    items: {
                        enum: ARRAY_ROLES_WITHOUT_ADMIN,

                    },
                },
            },
            additionalProperties: false,
        },
    },
};

const companyDriversFilterQuery = {
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

const companiesFilterQuery = {
    properties: {
        [HOMELESS_COLUMNS.FILTER]: {
            type: 'object',
            properties: {
                [colsCompanies.PRIMARY_CONFIRMED]: {
                    type: 'boolean',
                },
                [colsCompanies.EDITING_CONFIRMED]: {
                    type: 'boolean',
                },
            },
            additionalProperties: false,
        },
    },
};

const cargosFilterQuery = {
    properties: {
        [HOMELESS_COLUMNS.FILTER]: {
            type: 'object',
            properties: {
                [HOMELESS_COLUMNS.STATUS]: {
                    type: 'array',
                    minItems: 1,
                    uniqueItems: true,
                    items: {
                        enum: CARGO_STATUSES,
                    },

                },
            },
            additionalProperties: false,
        },
    },
};

const notRequiredFiles = {
    patternProperties: {
        '.': fileFormat,
    },
};

module.exports = {
    requiredUserId,
    requiredExistingUserWithIdAsync,
    requiredExistingCompanyWithIdAsync,
    requiredExistingCargoInCompanyAsyncFunc,
    requiredNotExistingCompanyEconomicSettingsWithIdAsync,
    requiredExistingCompanyEconomicSettingsWithIdAsync,

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

    confirmPhoneNumber,
    otherOrganizations,

    inviteUser,
    inviteUserAsync,
    createOrModifyDriver,
    modifyEmployeeAsyncFunc,

    requiredPassword,
    requiredEmail,
    requiredEmailAsync,

    createOrEditCargo,
    createOrEditCargoAsync,

    createOrEditEconomicSettings,
    createCompanyEconomicSettingsParamsAsync,
    requireExistingCompanyEconomicSettingsParamsAsync,

    modifyOtherOrganizations,
    inviteUserRolesParams,
    inviteUserRolesAdvancedParams,
    inviteUserWithoutCompanyRolesParams,
    inviteUserAdvancedFiles,
    requiredMeParams,
    requiredCompanyIdParams,
    meOrIdRequiredMeParams,
    meOrIdRequiredIdParams,
    listFilesGroupParams,

    basePaginationQuery,
    basePaginationModifyQuery,
    baseSortingSortingDirectionQuery,
    companyEmployeesSortColumnQuery,
    companiesSortColumnQuery,
    usersSortColumnQuery,
    modifyFilterQuery,
    companyEmployeesFilterQuery,
    usersFilterQuery,
    companyDriversFilterQuery,
    companiesFilterQuery,
    cargosFilterQuery,

    notRequiredFiles,
};
