const { get } = require('lodash');
const { success } = require('api/response');

// services
const DealsService = require('services/tables/deals');
const DealCarsService = require('services/tables/deal-cars');
const DealTrailersService = require('services/tables/deal-trailers');
const DealDriversService = require('services/tables/deal-drivers');

// constants
const { SQL_TABLES } = require('constants/tables');
const { SORTING_DIRECTIONS } = require('constants/pagination-sorting');

// formatters
const { formatPaginationDataForResponse } = require('formatters/pagination-sorting');
const { formatRecordForList, formatRecordForResponse } = require('formatters/deals');

// helpers
const { getParams } = require('helpers/pagination-sorting');

const colsUsers = SQL_TABLES.USERS.COLUMNS;
const colsDeals = SQL_TABLES.DEALS.COLUMNS;

const dealsPaginationOptions = {
    DEFAULT_LIMIT: 5,
    DEFAULT_SORT_COLUMN: SQL_TABLES.DEALS.COLUMNS.CREATED_AT,
    DEFAULT_SORT_DIRECTION: SORTING_DIRECTIONS.ASC,
};

const getListDeals = async (req, res, next) => {
    try {
        const { company, user } = res.locals;
        const userLanguageId = user[colsUsers.LANGUAGE_ID];
        const {
            page,
            limit,
            sortColumn,
            asc,
        } = getParams(req, dealsPaginationOptions);

        const filter = get(req, 'query.filter', {});

        const [deals, dealsCount] = await Promise.all([
            DealsService.getDealsPaginationSorting(company.id, limit, limit * page, sortColumn, asc, filter, userLanguageId),
            DealsService.getCountDeals(company.id, filter)
        ]);

        const result = formatPaginationDataForResponse(
            deals.map(deal => formatRecordForList(deal)),
            dealsCount,
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

const getDeal = async (req, res, next) => {
    try {
        const { user } = res.locals;
        const userLanguageId = user[colsUsers.LANGUAGE_ID];
        const { dealId } = req.params;

        const deal = await DealsService.getFullRecordStrict(dealId, userLanguageId);

        const dealCarId = deal[colsDeals.DEAL_CAR_ID];
        const dealTrailerId = deal[colsDeals.DEAL_TRAILER_ID];
        const dealDriverId = deal[colsDeals.DEAL_DRIVER_ID];

        const [dealCar, dealTrailer, dealDriver] = await Promise.all([
            dealCarId && DealCarsService.getRecord(dealCarId),
            dealTrailerId && DealTrailersService.getRecord(dealTrailerId),
            dealDriverId && DealDriversService.getRecord(dealDriverId),
        ]);

        const formattedDeal = formatRecordForResponse(deal, userLanguageId, dealCar, dealTrailer, dealDriver);

        return success(res, { ...formattedDeal });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getListDeals,
    getDeal,
};
