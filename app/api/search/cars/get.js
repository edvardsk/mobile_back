const { success } = require('api/response');

// services
const CarsServices = require('services/tables/cars');

// constants
const { HOMELESS_COLUMNS } = require('constants/tables');
const { SEARCH_ITEMS_TYPES } = require('constants/search');

// formatters
const {
    formatRecordForSearchResponse,
    formatRecordForSearchAllResponse,
} = require('formatters/cars');

const searchCars = async (req, res, next) => {
    try {
        const { companyId } = res.locals;
        const { query } = req;
        const showMyItems = query[HOMELESS_COLUMNS.SEARCH_ITEMS] === SEARCH_ITEMS_TYPES.INTERNAL;

        const cars = await CarsServices.getRecordsForSearch(companyId, showMyItems);
        const formattedCars = formatRecordForSearchResponse(cars);

        return success(res, {
            clusters: [],
            cars: formattedCars,
        });
    } catch (error) {
        next(error);
    }
};

const getAllCars = async (req, res, next) => {
    try {
        const { companyId } = res.locals;
        const { query } = req;
        const showMyItems = query[HOMELESS_COLUMNS.SEARCH_ITEMS] === SEARCH_ITEMS_TYPES.INTERNAL;

        const cars = await CarsServices.getAllNewRecordsForSearch(companyId, showMyItems);
        const formattedCargos = formatRecordForSearchAllResponse(cars);

        return success(res, {
            clusters: [],
            cars: formattedCargos,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    searchCars,
    getAllCars,
};
