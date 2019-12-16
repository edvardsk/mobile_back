const { get } = require('lodash');
const { success } = require('api/response');

// services
const DriversService = require('services/tables/drivers');
const CargosServices = require('services/tables/cargos');

// constants
const { SQL_TABLES } = require('constants/tables');
const { SORTING_DIRECTIONS } = require('constants/pagination-sorting');

// formatters
const { formatPaginationDataForResponse } = require('formatters/pagination-sorting');
const { formatRecordForAvailableList } = require('formatters/drivers');
const { formatCargoDates } = require('formatters/cargos');

// helpers
const { getParams } = require('helpers/pagination-sorting');

const availableDriversPaginationOptions = {
    DEFAULT_LIMIT: 5,
    DEFAULT_SORT_COLUMN: SQL_TABLES.DRIVERS.COLUMNS.CREATED_AT,
    DEFAULT_SORT_DIRECTION: SORTING_DIRECTIONS.ASC,
};

const colsUsers = SQL_TABLES.USERS.COLUMNS;

const getAvailableDrivers = async (req, res, next) => {
    try {
        const { company, user } = res.locals;
        const { cargoId } = req.params;
        const {
            page,
            limit,
            sortColumn,
            asc,
        } = getParams(req, availableDriversPaginationOptions);

        const filter = get(req, 'query.filter', {});

        const selectedCargo = await CargosServices.getRecordStrict(cargoId, user[colsUsers.LANGUAGE_ID]);

        const cargoDates = formatCargoDates(selectedCargo);

        const [drivers, driversCount] = await Promise.all([
            DriversService.getAvailableDriversPaginationSorting(company.id, cargoDates, limit, limit * page, sortColumn, asc, filter),
            DriversService.getCountAvailableDrivers(company.id, cargoDates, filter)
        ]);

        const result = formatPaginationDataForResponse(
            drivers.map(driver => formatRecordForAvailableList(driver)),
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
