const { get } = require('lodash');
const { success } = require('api/response');

// services
const TrailersService = require('services/tables/trailers');
const FilesService = require('services/tables/files');

// constants
const { SQL_TABLES } = require('constants/tables');
const { SORTING_DIRECTIONS } = require('constants/pagination-sorting');

// formatters
const { formatPaginationDataForResponse } = require('formatters/pagination-sorting');
const { formatRecordForList, formatRecordForResponse } = require('formatters/trailers');

// helpers
const { getParams } = require('helpers/pagination-sorting');

const trailersPaginationOptions = {
    DEFAULT_LIMIT: 5,
    DEFAULT_SORT_COLUMN: SQL_TABLES.TRAILERS.COLUMNS.CREATED_AT,
    DEFAULT_SORT_DIRECTION: SORTING_DIRECTIONS.ASC,
};

const getListTrailers = async (req, res, next) => {
    try {
        const { company } = res.locals;
        const {
            page,
            limit,
            sortColumn,
            asc,
        } = getParams(req, trailersPaginationOptions);

        const filter = get(req, 'query.filter', {});

        const [trailers, trailersCount] = await Promise.all([
            TrailersService.getTrailersPaginationSorting(company.id, limit, limit * page, sortColumn, asc, filter),
            TrailersService.getCountTrailers(company.id, filter)
        ]);

        const result = formatPaginationDataForResponse(
            trailers.map(trailer => formatRecordForList(trailer)),
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

const getTrailer = async (req, res, next) => {
    try {
        const { trailerId } = req.params;
        const trailer = await TrailersService.getRecordFullStrict(trailerId);
        const formattedData = formatRecordForResponse(trailer);
        formattedData.trailer.files = await FilesService.formatTemporaryLinks(formattedData.trailer.files);
        return success(res, { ...formattedData });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getListTrailers,
    getTrailer,
};