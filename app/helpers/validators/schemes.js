const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const colsUsers = SQL_TABLES.USERS.COLUMNS;
const colsCompanies = SQL_TABLES.COMPANIES.COLUMNS;

const uuid = '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

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
    properties: {
        [colsUsers.EMAIL]: {
            type: 'string',
            format: 'email',
        },
        [colsUsers.PASSWORD]: {
            type: 'string',
            pattern: '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,}$',
        },
        [HOMELESS_COLUMNS.ROLE_ID]: {
            type: 'string',
            pattern: uuid,
        },
    },
    required: [colsUsers.EMAIL, colsUsers.PASSWORD, HOMELESS_COLUMNS.ROLE_ID],
};

const authorization = {
    properties: {
        [colsUsers.EMAIL]: {
            type: 'string',
            format: 'email',
        },
        [colsUsers.PASSWORD]: {
            type: 'string',
            pattern: '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,}$',
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

module.exports = {
    registration,
    authorization,
    companyFieldsTransporter,
    companyFieldsHolder,
    companyFieldsForwarder,
    companyFilesTransporter,
    companyFilesHolder,
    companyFilesForwarder,
};
