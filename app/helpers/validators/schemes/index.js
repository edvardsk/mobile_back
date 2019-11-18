// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { FILES_GROUPS } = require('constants/files');

// patterns
const {
    DIGITS_VALIDATION_PATTERN,
    PASSWORD_VALIDATION_PATTERN,
    POSTGRES_MAX_STRING_LENGTH,
} = require('./patterns');

// helpers
const { fileFormat, otherOrganizations } = require('./helpers');

// exported schemes
const SortingPaginationSchemes = require('./sorting-pagination');
const FinishRegistrationSchemes = require('./finish-registration');
const InvitesSchemes = require('./invites');
const CargosSchemes = require('./cargos');
const SettingsSchemes = require('./settings');
const EmployeesSchemes = require('./employees');

const colsUsers = SQL_TABLES.USERS.COLUMNS;
const colsPhoneConfirmation = SQL_TABLES.PHONE_CONFIRMATION_CODES.COLUMNS;

const modifyOtherOrganizations = {
    properties: {
        [HOMELESS_COLUMNS.OTHER_ORGANIZATIONS]: {
            parse_string_to_json: {},
        },
    },
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

const requiredExistingCompanyWithIdAsync = {
    $async: true,
    properties: {
        companyId: {
            company_with_id_not_exist: {},
        },
    },
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

const notRequiredFiles = {
    patternProperties: {
        '.': fileFormat,
    },
};

module.exports = {
    requiredUserId,
    requiredExistingUserWithIdAsync,
    requiredExistingCompanyWithIdAsync,

    registration,
    registrationAsync,

    phoneNumberWithPrefixAsync,

    authorization,

    confirmPhoneNumber,
    otherOrganizations,

    requiredPassword,
    requiredEmail,
    requiredEmailAsync,

    modifyOtherOrganizations,

    requiredMeParams,
    requiredCompanyIdParams,
    meOrIdRequiredMeParams,
    meOrIdRequiredIdParams,
    listFilesGroupParams,
    notRequiredFiles,

    ...SortingPaginationSchemes,
    ...FinishRegistrationSchemes,
    ...InvitesSchemes,
    ...CargosSchemes,
    ...SettingsSchemes,
    ...EmployeesSchemes,
};
