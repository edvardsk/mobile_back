const { success } = require('api/response');

// services
const UsersService = require('services/tables/users');
const UsersCompaniesService = require('services/tables/users-to-companies');

// constants
const { SQL_TABLES } = require('constants/tables');
const { SORTING_DIRECTIONS } = require('constants/pagination-sorting');

// formatters
const { formatPaginationDataForResponse } = require('formatters/pagination-sorting');
const { formatUserWithPhoneAndRole } = require('formatters/users');

// helpers
const { getParams } = require('helpers/pagination-sorting');

const paginationOptions = {
    DEFAULT_LIMIT: 5,
    DEFAULT_SORT_COLUMN: SQL_TABLES.USERS.COLUMNS.CREATED_AT,
    DEFAULT_SORT_DIRECTION: SORTING_DIRECTIONS.ASC,
};

const getListEmployees = async (req, res, next) => {
    const colsUsersCompanies = SQL_TABLES.USERS_TO_COMPANIES.COLUMNS;
    try {
        const userId = res.locals.user.id;
        const {
            page,
            limit,
            sortColumn,
            asc,
        } = getParams(req, paginationOptions);

        const userCompany = await UsersCompaniesService.getRecordByUserIdStrict(userId);
        const companyId = userCompany[colsUsersCompanies.COMPANY_ID];

        const [users, usersCount] = await Promise.all([
            UsersService.getUsersByCompanyIdPaginationSorting(companyId, limit, limit * page, sortColumn, asc),
            UsersService.getCountUsersByCompanyId(companyId)
        ]);

        const result = formatPaginationDataForResponse(
            users.map(file => formatUserWithPhoneAndRole(file)),
            usersCount,
            limit,
            page,
            sortColumn,
            asc
        );

        return success(res, result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getListEmployees,
};
