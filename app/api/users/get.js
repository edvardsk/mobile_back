const { get } = require('lodash');
const { success } = require('api/response');

// services
const UsersService = require('services/tables/users');

// formatters
const { formatUserWithPermissionsForResponse, formatUserForResponse } = require('formatters/users');
const { formatPaginationDataForResponse } = require('formatters/pagination-sorting');

// helpers
const { getParams } = require('helpers/pagination-sorting');

// constants
const { SQL_TABLES } = require('constants/tables');
const { SORTING_DIRECTIONS } = require('constants/pagination-sorting');

const getUser = async (req, res, next) => {
    try {
        const { user, permissions } = res.locals;
        return success(res, { user: formatUserWithPermissionsForResponse(user, permissions) });
    } catch (error) {
        next(error);
    }
};

const usersPaginationOptions = {
    DEFAULT_LIMIT: 5,
    DEFAULT_SORT_COLUMN: SQL_TABLES.USERS.COLUMNS.CREATED_AT,
    DEFAULT_SORT_DIRECTION: SORTING_DIRECTIONS.ASC,
};

const getUsers = async (req, res, next) => {
    try {
        const {
            page,
            limit,
            sortColumn,
            asc,
        } = getParams(req, usersPaginationOptions);

        const filter = get(req, 'query.filter', {});

        const [users, usersCount] = await Promise.all([
            UsersService.getUsersPaginationSorting(limit, limit * page, sortColumn, asc, filter),
            UsersService.getCountUsers(filter)
        ]);

        const result = formatPaginationDataForResponse(
            users.map(user => formatUserForResponse(user)),
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
    getUser,
    getUsers,
};
