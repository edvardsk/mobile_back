const { get } = require('lodash');
const { success } = require('api/response');

// services
const CarsService = require('services/tables/cars');

// constants
const { SQL_TABLES } = require('constants/tables');
const { SORTING_DIRECTIONS } = require('constants/pagination-sorting');

// formatters
const { formatPaginationDataForResponse } = require('formatters/pagination-sorting');
const { formatRecordForListAvailable } = require('formatters/cars');

// helpers
const { getParams } = require('helpers/pagination-sorting');

const availableCarsPaginationOptions = {
    DEFAULT_LIMIT: 5,
    DEFAULT_SORT_COLUMN: SQL_TABLES.CARS.COLUMNS.CREATED_AT,
    DEFAULT_SORT_DIRECTION: SORTING_DIRECTIONS.ASC,
};

const getAvailableCars = async (req, res, next) => {
    try {
        const { company } = res.locals;
        const {
            page,
            limit,
            sortColumn,
            asc,
        } = getParams(req, availableCarsPaginationOptions);

        const filter = get(req, 'query.filter', {});

        const [cars, carsCount] = await Promise.all([
            CarsService.getAvailableCarsByCompanyIdPaginationSorting(company.id, limit, limit * page, sortColumn, asc, filter),
            CarsService.getCountAvailableCars(company.id, filter)
        ]);

        const result = formatPaginationDataForResponse(
            cars.map(car => formatRecordForListAvailable(car)),
            carsCount,
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
    getAvailableCars,
};
