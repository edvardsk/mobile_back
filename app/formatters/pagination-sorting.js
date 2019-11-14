const { isEmpty } = require('lodash');

const { PAGINATION_PARAMS, SORTING_PARAMS, SORTING_DIRECTIONS } = require('constants/pagination-sorting');

const formatPaginationDataForResponse = (values, countValues, limit, page, sort, asc, filter) => ({
    values,
    count_values: countValues,
    [PAGINATION_PARAMS.PAGE]: page,
    [PAGINATION_PARAMS.LIMIT]: limit,
    pages: Math.ceil(countValues / limit),
    [SORTING_PARAMS.SORT_COLUMN]: sort,
    [SORTING_PARAMS.SORT_DIRECTION]: asc ? SORTING_DIRECTIONS.ASC : SORTING_DIRECTIONS.DESC,
    filter: isEmpty(filter) ? undefined : filter,
});

module.exports = {
    formatPaginationDataForResponse,
};
