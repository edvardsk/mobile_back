const { get } = require('lodash');
const { success } = require('api/response');

// services
const CarsService = require('services/tables/cars');
const CargosServices = require('services/tables/cargos');

// constants
const { SQL_TABLES } = require('constants/tables');
const { SORTING_DIRECTIONS } = require('constants/pagination-sorting');

// formatters
const { formatPaginationDataForResponse } = require('formatters/pagination-sorting');
const { formatRecordForListAvailable } = require('formatters/cars');
const { formatCargoDates } = require('formatters/cargos');

// helpers
const { getParams } = require('helpers/pagination-sorting');

const availableCarsPaginationOptions = {
    DEFAULT_LIMIT: 5,
    DEFAULT_SORT_COLUMN: SQL_TABLES.CARS.COLUMNS.CREATED_AT,
    DEFAULT_SORT_DIRECTION: SORTING_DIRECTIONS.ASC,
};

const colsUsers = SQL_TABLES.USERS.COLUMNS;

const getAvailableCars = async (req, res, next) => {
    try {
        const { company, user } = res.locals;
        const { cargoId } = req.params;
        const {
            page,
            limit,
            sortColumn,
            asc,
        } = getParams(req, availableCarsPaginationOptions);

        const filter = get(req, 'query.filter', {});

        const selectedCargo = await CargosServices.getRecordStrict(cargoId, user[colsUsers.LANGUAGE_ID]);
        const cargoDates = formatCargoDates(selectedCargo);

        const [cars, carsCount] = await Promise.all([
            CarsService.getAvailableCarsByCompanyIdPaginationSorting(company.id, cargoDates, limit, limit * page, sortColumn, asc, filter),
            CarsService.getCountAvailableCars(company.id, cargoDates, filter)
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
