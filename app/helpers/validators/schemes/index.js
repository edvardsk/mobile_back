// constants
const { SQL_TABLES } = require('constants/tables');

// patterns
const {
    PASSWORD_VALIDATION_PATTERN,
    POSTGRES_MAX_STRING_LENGTH,
} = require('./patterns');

const colsUsers = SQL_TABLES.USERS.COLUMNS;

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

const registration = {
    properties: {
        [colsUsers.PASSWORD]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
            pattern: PASSWORD_VALIDATION_PATTERN,
        },
        [colsUsers.NAME]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
    },
    required: [
        colsUsers.PASSWORD,
        colsUsers.NAME,
    ],
    additionalProperties: false,
};

const authorization = {
    properties: {
        [colsUsers.NAME]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
        [colsUsers.PASSWORD]: {
            type: 'string',
            pattern: PASSWORD_VALIDATION_PATTERN,
        },
    },
    required: [colsUsers.NAME, colsUsers.PASSWORD],
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

// const notRequiredFiles = {
//     patternProperties: {
//         '.': fileFormat,
//     },
// };


module.exports = {
    requiredUserId,
    requiredExistingUserWithIdAsync,

    registration,

    authorization,

    requiredMeParams,
    meOrIdRequiredMeParams,
    meOrIdRequiredIdParams,
    // notRequiredFiles,
};
