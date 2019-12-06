const { get } = require('lodash');
const { success } = require('api/response');

// services
const DriversService = require('services/tables/drivers');

// constants
const { SQL_TABLES } = require('constants/tables');
const { SORTING_DIRECTIONS } = require('constants/pagination-sorting');

// formatters
const { formatPaginationDataForResponse } = require('formatters/pagination-sorting');
const { formatRecordForList } = require('formatters/drivers');

// helpers
const { getParams } = require('helpers/pagination-sorting');

const availableDriversPaginationOptions = {
    DEFAULT_LIMIT: 5,
    DEFAULT_SORT_COLUMN: SQL_TABLES.DRIVERS.COLUMNS.CREATED_AT,
    DEFAULT_SORT_DIRECTION: SORTING_DIRECTIONS.ASC,
};

const getAvailableDrivers = async (req, res, next) => {
    try {
        const { company } = res.locals;
        const {
            page,
            limit,
            sortColumn,
            asc,
        } = getParams(req, availableDriversPaginationOptions);

        const filter = get(req, 'query.filter', {});

        const [drivers, driversCount] = await Promise.all([
            DriversService.getAvailableDriversPaginationSorting(company.id, limit, limit * page, sortColumn, asc, filter),
            DriversService.getCountAvailableDrivers(company.id, filter)
        ]);

        const result = formatPaginationDataForResponse(
            drivers.map(driver => formatRecordForList(driver)),
            driversCount,
            limit,
            page,
            sortColumn,
            asc,
            filter
        );

        return success(res, result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAvailableDrivers,
};
