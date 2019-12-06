// constants
const {
    PAGINATION_PARAMS,
    SORTING_PARAMS,
    SORTING_DIRECTIONS,
    COMPANY_EMPLOYEES_SORT_COLUMNS,
    COMPANIES_SORT_COLUMNS,
    COMPANIES_ECONOMIC_SETTINGS_SORT_COLUMNS,
    USERS_SORT_COLUMNS,
} = require('constants/pagination-sorting');
const { ARRAY_ROLES_WITHOUT_ADMIN } = require('constants/system');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

// patterns
const {
    DIGITS_VALIDATION_PATTERN,
} = require('./patterns');

const colsUsers = SQL_TABLES.USERS.COLUMNS;
const colsCompanies = SQL_TABLES.COMPANIES.COLUMNS;

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

const companiesEconomicSettingsSortColumnQuery = {
    properties: {
        [SORTING_PARAMS.SORT_COLUMN]: {
            type: 'string',
            enum: COMPANIES_ECONOMIC_SETTINGS_SORT_COLUMNS,
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
                [HOMELESS_COLUMNS.SEARCH]: {
                    type: 'string',
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

const companiesEconomicSettingsFilterQuery = {
    properties: {
        [HOMELESS_COLUMNS.FILTER]: {
            type: 'object',
            properties: {
            },
            additionalProperties: false,
        },
    },
};

const cargosFilterQuery = {
    properties: {
        [HOMELESS_COLUMNS.FILTER]: {
            type: 'object',
            properties: {},
            additionalProperties: false,
        },
    },
};

const carsFilterQuery = {
    properties: {
        [HOMELESS_COLUMNS.FILTER]: {
            type: 'object',
            properties: {
                [HOMELESS_COLUMNS.QUERY]: {
                    type: 'string',
                    minLength: 1,
                },
            },
            additionalProperties: false,
        },
    },
};

const carsDealsAvailableFilterQuery = {
    properties: {
        [HOMELESS_COLUMNS.FILTER]: {
            type: 'object',
            properties: {
                [HOMELESS_COLUMNS.CAR_STATE_NUMBER]: {
                    type: 'string',
                    minLength: 1,
                },
            },
            additionalProperties: false,
        },
    },
};

const trailersFilterQuery = {
    properties: {
        [HOMELESS_COLUMNS.FILTER]: {
            type: 'object',
            properties: {
                [HOMELESS_COLUMNS.QUERY]: {
                    type: 'string',
                    minLength: 1,
                },
                [HOMELESS_COLUMNS.LINKED]: {
                    type: 'boolean',
                },
            },
            additionalProperties: false,
        },
    },
};

module.exports = {
    basePaginationQuery,
    basePaginationModifyQuery,
    baseSortingSortingDirectionQuery,
    companyEmployeesSortColumnQuery,
    companiesSortColumnQuery,
    companiesEconomicSettingsSortColumnQuery,
    usersSortColumnQuery,
    modifyFilterQuery,
    companyEmployeesFilterQuery,
    usersFilterQuery,
    companyDriversFilterQuery,
    companiesFilterQuery,
    companiesEconomicSettingsFilterQuery,
    cargosFilterQuery,
    carsFilterQuery,
    trailersFilterQuery,
    carsDealsAvailableFilterQuery,
};
