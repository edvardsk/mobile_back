const { get } = require('lodash');
const { success } = require('api/response');

// services
const CompaniesService = require('services/tables/companies');

// constants
const { SQL_TABLES } = require('constants/tables');
const { SORTING_DIRECTIONS } = require('constants/pagination-sorting');

// formatters
const { formatPaginationDataForResponse } = require('formatters/pagination-sorting');
const { formatCompanyToResponse } = require('formatters/companies');

// helpers
const { getParams } = require('helpers/pagination-sorting');

const companiesPaginationOptions = {
    DEFAULT_LIMIT: 5,
    DEFAULT_SORT_COLUMN: SQL_TABLES.COMPANIES.COLUMNS.CREATED_AT,
    DEFAULT_SORT_DIRECTION: SORTING_DIRECTIONS.ASC,
};

const getListCompanies = async (req, res, next) => {
    try {
        const {
            page,
            limit,
            sortColumn,
            asc,
        } = getParams(req, companiesPaginationOptions);

        const filter = get(req, 'query.filter', {});

        const [users, usersCount] = await Promise.all([
            CompaniesService.getCompaniesPaginationSorting(limit, limit * page, sortColumn, asc, filter),
            CompaniesService.getCountCompanies(filter)
        ]);

        const result = formatPaginationDataForResponse(
            users.map(user => formatCompanyToResponse(user)),
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
    getListCompanies,
};
