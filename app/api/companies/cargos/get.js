const { get } = require('lodash');
const { success } = require('api/response');

// services
const CargosServices = require('services/tables/cargos');

// constants
const { SQL_TABLES } = require('constants/tables');
const { SORTING_DIRECTIONS } = require('constants/pagination-sorting');

// formatters
const { formatPaginationDataForResponse } = require('formatters/pagination-sorting');
const { formatRecordForList, formatRecordForResponse } = require('formatters/cargos');

// helpers
const { getParams } = require('helpers/pagination-sorting');

const cargosPaginationOptions = {
    DEFAULT_LIMIT: 5,
    DEFAULT_SORT_COLUMN: SQL_TABLES.CARGOS.COLUMNS.CREATED_AT,
    DEFAULT_SORT_DIRECTION: SORTING_DIRECTIONS.ASC,
};

const getCargos = async (req, res, next) => {
    try {
        const { company } = res.locals;
        const {
            page,
            limit,
            sortColumn,
            asc,
        } = getParams(req, cargosPaginationOptions);

        const filter = get(req, 'query.filter', {});

        const [cargos, cargosCount] = await Promise.all([
            CargosServices.getCargosPaginationSorting(company.id, limit, limit * page, sortColumn, asc, filter),
            CargosServices.getCountCargos(company.id, filter)
        ]);

        const result = formatPaginationDataForResponse(
            cargos.map(cargo => formatRecordForList(cargo)),
            cargosCount,
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

const getCargo = async (req, res, next) => {
    try {
        const { cargoId } = req.params;
        const cargo = await CargosServices.getRecordStrict(cargoId);
        return success(res, { cargo: formatRecordForResponse(cargo) });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCargos,
    getCargo,
};
