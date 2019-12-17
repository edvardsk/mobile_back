// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

// patterns
const {
    POSTGRES_MAX_STRING_LENGTH,
} = require('./patterns');

const colsTNVEDCodesKeywords = SQL_TABLES.TNVED_CODES_KEYWORDS.COLUMNS;

const createOrEditTNVEDKeyword = {
    properties: {
        [colsTNVEDCodesKeywords.TNVED_CODE_ID]: {
            type: 'string',
            format: 'uuid',
        },
        [colsTNVEDCodesKeywords.LANGUAGE_ID]: {
            type: 'string',
            format: 'uuid',
        },
        [colsTNVEDCodesKeywords.VALUE]: {
            type: 'string',
            maxLength: POSTGRES_MAX_STRING_LENGTH,
        },
    },
    required: [
        colsTNVEDCodesKeywords.TNVED_CODE_ID,
        colsTNVEDCodesKeywords.LANGUAGE_ID,
        colsTNVEDCodesKeywords.VALUE,
    ],
    additionalProperties: false,
};

const tnvedCodesIdQuery = {
    properties: {
        [colsTNVEDCodesKeywords.TNVED_CODE_ID]: {
            type: 'string',
            format: 'uuid',
        },
        [HOMELESS_COLUMNS.LANGUAGE_CODE]: {
            type: 'string',
            minLength: 2,
            maxLength: 10,
        },
    },
    required: [
        colsTNVEDCodesKeywords.TNVED_CODE_ID,
    ],
    additionalProperties: false,
};

module.exports = {
    createOrEditTNVEDKeyword,
    tnvedCodesIdQuery,
};
