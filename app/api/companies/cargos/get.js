const { get } = require('lodash');
const { success } = require('api/response');

// services
const CargosServices = require('services/tables/cargos');
const ExchangeRatesServices = require('services/tables/exchange-rates');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { SORTING_DIRECTIONS } = require('constants/pagination-sorting');

// formatters
const { formatPaginationDataForResponse } = require('formatters/pagination-sorting');
const { formatRecordForList, formatRecordForResponse } = require('formatters/cargos');

// helpers
const { getParams } = require('helpers/pagination-sorting');
const { calculateCargoPrice } = require('helpers/cargos');

const colsUsers = SQL_TABLES.USERS.COLUMNS;

const cargosPaginationOptions = {
    DEFAULT_LIMIT: 5,
    DEFAULT_SORT_COLUMN: SQL_TABLES.CARGOS.COLUMNS.CREATED_AT,
    DEFAULT_SORT_DIRECTION: SORTING_DIRECTIONS.ASC,
};

const getCargos = async (req, res, next) => {
    try {
        const { company, user } = res.locals;
        const userLanguageId = user[colsUsers.LANGUAGE_ID];
        const userCountryId = user[HOMELESS_COLUMNS.COUNTRY_ID];
        const userCurrencyId = user[HOMELESS_COLUMNS.CURRENCY_ID];
        const userCurrencyCode = user[HOMELESS_COLUMNS.CURRENCY_CODE];

        const {
            page,
            limit,
            sortColumn,
            asc,
        } = getParams(req, cargosPaginationOptions);

        const filter = get(req, 'query.filter', {});

        const [cargos, cargosCount, rates] = await Promise.all([
            CargosServices.getCargosPaginationSorting(company.id, limit, limit * page, sortColumn, asc, filter, userLanguageId),
            CargosServices.getCountCargos(company.id, filter),
            ExchangeRatesServices.getRecordsByCountryId(userCountryId)
        ]);

        const result = formatPaginationDataForResponse(
            cargos.map(cargo => {
                const formattedCargo = formatRecordForList(cargo, userLanguageId);
                return {
                    ...formattedCargo,
                    [HOMELESS_COLUMNS.PRICES]: calculateCargoPrice(cargo, [...rates], userCurrencyId, userCurrencyCode),
                };
            }),
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
        const { user } = res.locals;

        const userLanguageId = user[colsUsers.LANGUAGE_ID];
        const userCountryId = user[HOMELESS_COLUMNS.COUNTRY_ID];
        const userCurrencyId = user[HOMELESS_COLUMNS.CURRENCY_ID];
        const userCurrencyCode = user[HOMELESS_COLUMNS.CURRENCY_CODE];

        const { cargoId } = req.params;
        const [cargo, rates] = await Promise.all([
            CargosServices.getRecordStrict(cargoId, userLanguageId),
            ExchangeRatesServices.getRecordsByCountryId(userCountryId)
        ]);

        const prices = calculateCargoPrice(cargo, rates, userCurrencyId, userCurrencyCode);

        return success(res, { cargo: formatRecordForResponse(cargo, prices, userLanguageId) });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCargos,
    getCargo,
};
