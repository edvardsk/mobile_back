// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { DOCUMENTS } = require('constants/files');
const { ROLES } = require('constants/system');

// patterns
const {
    DIGITS_VALIDATION_PATTERN,
    POSTGRES_MAX_STRING_LENGTH,
} = require('./patterns');

// helpers
const { fileFormat } = require('./helpers');

const colsUsers = SQL_TABLES.USERS.COLUMNS;

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

module.exports = {
    inviteUser,
    inviteUserAsync,
    inviteUserRolesParams,
    inviteUserRolesAdvancedParams,
    inviteUserWithoutCompanyRolesParams,
    inviteUserAdvancedFiles,
};
