const  { one, manyOrNone } = require('db');

// sql-helpers
const {
    insertRecords,
    selectDealsByCompanyIdPaginationSorting,
    selectCountDealsByCompanyId,
    selectRecordById,
} = require('sql-helpers/deals');

// services
const DriversService = require('./drivers');
const CarsService = require('./cars');
const TrailersService = require('./trailers');
const CargosService = require('./cargos');

// constants
const { HOMELESS_COLUMNS } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const { OPERATIONS } = require('constants/postgres');
const { LOADING_TYPES_MAP } = require('constants/cargos');

// helpers
const { isValidUUID } = require('helpers/validators');

// formatters
const { formatCargoDates } = require('formatters/cargos');

const addRecordsAsTransaction = values => [insertRecords(values), OPERATIONS.MANY];

const getRecordStrict = (id, userLanguageId) => one(selectRecordById(id, userLanguageId));

const validateDealItems = async (arr, companyId, cargoLoadingType, userLanguageId) => {
    const availableDrivers = [];
    const availableCars = [];
    const availableTrailers = [];
    const items = cargoLoadingType === LOADING_TYPES_MAP.FTL ? [...arr] : [arr[0]]; // use only first item for LTL (because drivers/cars/trailers the same for all items)
    const invalidItems = await Promise.all(items.map(async (item, i) => {
        const cargoId = item[HOMELESS_COLUMNS.CARGO_ID];
        const driverIdOrData = item[HOMELESS_COLUMNS.DRIVER_ID_OR_DATA];
        const carIdOrData = item[HOMELESS_COLUMNS.CAR_ID_OR_DATA];
        const trailerIdOrData = item[HOMELESS_COLUMNS.TRAILER_ID_OR_DATA];
        const cargo = await CargosService.getRecordStrict(cargoId, userLanguageId);
        const cargoDates = formatCargoDates(cargo);

        if (isValidUUID(driverIdOrData)) {
            const availableDriver = await DriversService.getAvailableDriverByIdAndCompanyId(driverIdOrData, companyId, cargoDates);
            if (!availableDriver) {
                return {
                    position: i,
                    type: ERRORS.DEALS.INVALID_DRIVER_ID,
                };
            } else {
                availableDrivers.push(availableDriver);
            }
        }
        if (isValidUUID(carIdOrData)) {
            const availableCar = await CarsService.getAvailableCarByIdAndCompanyId(carIdOrData, companyId, cargoDates);
            if (!availableCar) {
                return {
                    position: i,
                    type: ERRORS.DEALS.INVALID_CAR_ID,
                };
            } else {
                availableCars.push(availableCar);
            }
        }
        if (isValidUUID(trailerIdOrData)) {
            const availableTrailer = await TrailersService.getAvailableTrailerByIdAndCompanyId(trailerIdOrData, companyId, cargoDates);
            if (!availableTrailer) {
                return {
                    position: i,
                    type: ERRORS.DEALS.INVALID_TRAILER_ID,
                };
            } else {
                availableTrailers.push(availableTrailer);
            }
        }
    }));
    return [invalidItems.filter(Boolean), availableCars, availableTrailers, availableDrivers];
};

const getDealsPaginationSorting = (companyId, limit, offset, sortColumn, asc, filter, userLanguageId) => (
    manyOrNone(selectDealsByCompanyIdPaginationSorting(companyId, limit, offset, sortColumn, asc, filter, userLanguageId))
);

const getCountDeals = (companyId, filter) => (
    one(selectCountDealsByCompanyId(companyId, filter))
        .then(({ count }) => +count)
);

module.exports = {
    addRecordsAsTransaction,
    getRecordStrict,
    validateDealItems,
    getDealsPaginationSorting,
    getCountDeals,
};
