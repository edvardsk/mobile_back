const moment = require('moment');

// constants
const { PAGINATION_PARAMS } = require('constants/pagination-sorting');
const { STRING_BOOLEANS_MAP } = require('constants/index');

const parseStringToJson = (data, dataPath, parentData, parentDataProperty) => {
    try {
        const value = JSON.parse(parentData[parentDataProperty]);
        parentData[parentDataProperty] = value;
    } catch (error) {
        return false;
    }
    return true;
};

const parseStringToFloat = (data, dataPath, parentData, parentDataProperty) => {
    try {
        const value = parentData[parentDataProperty];
        if (value) {
            parentData[parentDataProperty] = parseFloat(value);
        }
        return true;
    } catch (error) {
        return false;
    }
};

const parseStringBooleanToBoolean = (data, dataPath, parentData, parentDataProperty) => {
    try {
        if (data === STRING_BOOLEANS_MAP.TRUE) {
            parentData[parentDataProperty] = true;
            return true;
        } else if (data === STRING_BOOLEANS_MAP.FALSE) {
            parentData[parentDataProperty] = false;
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
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

const compareYears = (value1, value2) => {
    const str1 = value1.toString();
    const str2 = value2.toString();

    const year1 = +moment({ year: str1 }).format('YYYY');
    const date2Full = str2 !== 'current' ? moment({ year: str2 }) : moment();
    const year2 = +date2Full.format('YYYY');

    return year1 - year2;
};

module.exports = {
    parseStringToJson,
    parseStringToFloat,
    parseStringBooleanToBoolean,
    parsePaginationOptions,
    compareYears,
};
