// constants
const { PAGINATION_PARAMS } = require('constants/pagination-sorting');

const parseStringToJson = (data, dataPath, parentData, parentDataProperty) => {
    try {
        const value = JSON.parse(parentData[parentDataProperty]);
        parentData[parentDataProperty] = value;
    } catch (error) {
        return false;
    }
    return true;
};

const parsePaginationOptions = (data, dataPath, parentData, parentDataProperty) => {
    try {
        if (PAGINATION_PARAMS.PAGE === parentDataProperty) {
            parentData[PAGINATION_PARAMS.PAGE] = parseInt(parentData[PAGINATION_PARAMS.PAGE]);
        } else if (PAGINATION_PARAMS.LIMIT === parentDataProperty) {
            parentData[PAGINATION_PARAMS.LIMIT] = parseInt(parentData[PAGINATION_PARAMS.LIMIT]);
        }
    } catch (error) {
        return false;
    }
    return true;
};

module.exports = {
    parseStringToJson,
    parsePaginationOptions,
};
