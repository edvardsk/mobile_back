const { get } = require('lodash');
const { success } = require('api/response');

// services
const TrailersService = require('services/tables/trailers');
const CargosServices = require('services/tables/cargos');

// constants
const { SQL_TABLES } = require('constants/tables');
const { SORTING_DIRECTIONS } = require('constants/pagination-sorting');

// formatters
const { formatPaginationDataForResponse } = require('formatters/pagination-sorting');
const { formatRecordForListAvailable } = require('formatters/trailers');
const { formatCargoDates } = require('formatters/cargos');

// helpers
const { getParams } = require('helpers/pagination-sorting');

const availableTrailersPaginationOptions = {
    DEFAULT_LIMIT: 5,
    DEFAULT_SORT_COLUMN: SQL_TABLES.TRAILERS.COLUMNS.CREATED_AT,
    DEFAULT_SORT_DIRECTION: SORTING_DIRECTIONS.ASC,
};

const colsUsers = SQL_TABLES.USERS.COLUMNS;

const getAvailableTrailers = async (req, res, next) => {
    try {
        const { company, user } = res.locals;
        const { cargoId } = req.params;
        const {
            page,
            limit,
            sortColumn,
            asc,
        } = getParams(req, availableTrailersPaginationOptions);

        const filter = get(req, 'query.filter', {});

        const selectedCargo = await CargosServices.getRecordStrict(cargoId, user[colsUsers.LANGUAGE_ID]);

        const cargoDates = formatCargoDates(selectedCargo);

        const [trailers, trailersCount] = await Promise.all([
            TrailersService.getAvailableTrailersPaginationSorting(company.id, cargoDates, limit, limit * page, sortColumn, asc, filter),
            TrailersService.getCountAvailableTrailers(company.id, cargoDates, filter)
        ]);

        const result = formatPaginationDataForResponse(
            trailers.map(trailer => formatRecordForListAvailable(trailer)),
            trailersCount,
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
    getAvailableTrailers,
};
