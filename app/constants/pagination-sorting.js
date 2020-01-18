const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const colsUsers = SQL_TABLES.USERS.COLUMNS;
const colsCompanies = SQL_TABLES.COMPANIES.COLUMNS;
const colsEconomicSettings = SQL_TABLES.ECONOMIC_SETTINGS.COLUMNS;

const PAGINATION_PARAMS = {
    PAGE: 'page',
    LIMIT: 'limit',
};

const SORTING_PARAMS = {
    SORT_COLUMN: 'sort_column',
    SORT_DIRECTION: 'sort_direction',
};

const SORTING_DIRECTIONS = {
    ASC: 'asc',
    DESC: 'desc',
};

const COMPANY_EMPLOYEES_SORT_COLUMNS = [
    colsUsers.EMAIL, colsUsers.FULL_NAME, colsUsers.CREATED_AT, HOMELESS_COLUMNS.FULL_PHONE_NUMBER, HOMELESS_COLUMNS.ROLE
];

const COMPANIES_SORT_COLUMNS = [
    colsCompanies.NAME, colsCompanies.CREATED_AT
];

const COMPANIES_ECONOMIC_SETTINGS_SORT_COLUMNS = [
    colsEconomicSettings.PERCENT_FROM_TRANSPORTER,
    colsEconomicSettings.PERCENT_FROM_HOLDER,
    colsEconomicSettings.PERCENT_TO_FORWARDER,
    colsEconomicSettings.CREATED_AT,
];

const USERS_SORT_COLUMNS = [
    colsUsers.EMAIL, colsUsers.FULL_NAME, colsUsers.CREATED_AT, HOMELESS_COLUMNS.ROLE
];

module.exports = {
    PAGINATION_PARAMS,
    SORTING_PARAMS,
    SORTING_DIRECTIONS,

    COMPANY_EMPLOYEES_SORT_COLUMNS,
    COMPANIES_ECONOMIC_SETTINGS_SORT_COLUMNS,
    COMPANIES_SORT_COLUMNS,
    USERS_SORT_COLUMNS,
};
