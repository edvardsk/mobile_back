const { get } = require('lodash');

const getParams = (req, {
    DEFAULT_LIMIT,
    DEFAULT_SORT_COLUMN,
    DEFAULT_SORT_DIRECTION,
}) => {
    const page = parseInt(get(req, 'query.page', 0));

    const limit = parseInt(get(req, 'query.limit', DEFAULT_LIMIT));

    const sortColumn = get(req, 'query.sort_column', DEFAULT_SORT_COLUMN);

    const asc = get(req, 'query.sort_direction', DEFAULT_SORT_DIRECTION) === 'asc';
    return { page, limit, sortColumn, asc };
};

module.exports = {
    getParams,
};
