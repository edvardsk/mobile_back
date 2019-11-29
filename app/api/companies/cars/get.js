const { get } = require('lodash');
const { success } = require('api/response');

// services
const CarsService = require('services/tables/cars');
const FilesService = require('services/tables/files');

// constants
const { SQL_TABLES } = require('constants/tables');
const { SORTING_DIRECTIONS } = require('constants/pagination-sorting');

// formatters
const { formatPaginationDataForResponse } = require('formatters/pagination-sorting');
const { formatRecordForList, formatRecordForResponse } = require('formatters/cars');

// helpers
const { getParams } = require('helpers/pagination-sorting');

const carsPaginationOptions = {
    DEFAULT_LIMIT: 5,
    DEFAULT_SORT_COLUMN: SQL_TABLES.CARS.COLUMNS.CREATED_AT,
    DEFAULT_SORT_DIRECTION: SORTING_DIRECTIONS.ASC,
};

const getListCars = async (req, res, next) => {
    try {
        const { company } = res.locals;
        const {
            page,
            limit,
            sortColumn,
            asc,
        } = getParams(req, carsPaginationOptions);

        const filter = get(req, 'query.filter', {});

        const [cars, carsCount] = await Promise.all([
            CarsService.getCarsPaginationSorting(company.id, limit, limit * page, sortColumn, asc, filter),
            CarsService.getCountCars(company.id, filter)
        ]);

        const result = formatPaginationDataForResponse(
            cars.map(car => formatRecordForList(car)),
            carsCount,
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

const getCar = async (req, res, next) => {
    try {
        const { carId } = req.params;
        const car = await CarsService.getRecordFullStrict(carId);
        const formattedData = formatRecordForResponse(car);
        formattedData.car.files = await FilesService.formatTemporaryLinks(formattedData.car.files);
        return success(res, { ...formattedData });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getListCars,
    getCar,
};
