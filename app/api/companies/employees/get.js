const { success, reject } = require('api/response');
const { get } = require('lodash');

// services
const UsersService = require('services/tables/users');
const CompaniesService = require('services/tables/companies');
const UsersCompaniesService = require('services/tables/users-to-companies');

// constants
const { SQL_TABLES } = require('constants/tables');
const { ERRORS } = require('constants/errors');
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
        const isControlRole = res.locals.user.isControlRole;

        const { meOrId } = req.params;

        let companyId;
        if (isControlRole) {
            const company = await CompaniesService.getCompany(meOrId);
            if (!company) {
                return reject(res, ERRORS.COMPANIES.INVALID_COMPANY_ID);
            }
            companyId = company.id;
        } else {
            const userCompany = await UsersCompaniesService.getRecordByUserIdStrict(userId);
            companyId = userCompany[colsUsersCompanies.COMPANY_ID];
        }

        const {
            page,
            limit,
            sortColumn,
            asc,
        } = getParams(req, paginationOptions);

        const filter = get(req, 'query.filter', {});

        const [users, usersCount] = await Promise.all([
            UsersService.getUsersByCompanyIdPaginationSorting(companyId, limit, limit * page, sortColumn, asc, filter),
            UsersService.getCountUsersByCompanyId(companyId, filter)
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
