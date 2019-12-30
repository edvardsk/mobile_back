const  { one, oneOrNone, manyOrNone } = require('db');

// sql-helpers
const {
    insertRecords,
    updateRecord,
    selectDealsByCompanyIdPaginationSorting,
    selectCountDealsByCompanyId,
    selectRecordById,
    selectRecordWithInstancesInfoById,
    selectDealsInProcessByRangeAndCarId,
} = require('sql-helpers/deals');

// services
const DriversService = require('./drivers');
const CarsService = require('./cars');
const TrailersService = require('./trailers');
const CargosService = require('./cargos');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const { OPERATIONS } = require('constants/postgres');
const { LOADING_TYPES_MAP } = require('constants/cargos');
const { FINISHED_STATUSES_LIST, ALLOWED_NEXT_STATUSES_MAP } = require('constants/deal-statuses');

// helpers
const { isValidUUID } = require('helpers/validators');

// formatters
const { formatCargoDates } = require('formatters/cargos');

const cols = SQL_TABLES.DEALS.COLUMNS;
const colsCargos = SQL_TABLES.CARGOS.COLUMNS;

const addRecordsAsTransaction = values => [insertRecords(values), OPERATIONS.MANY];

const editRecordAsTransaction = (id, data) => [updateRecord(id, data), OPERATIONS.ONE];

const getRecordStrict = id => one(selectRecordById(id));

const getRecordWithInstancesInfoStrict = id => one(selectRecordWithInstancesInfoById(id));

const getRecord = id => oneOrNone(selectRecordById(id));

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
            const availableCar = await CarsService.getAvailableCarByIdAndCompanyId(carIdOrData, companyId, cargoDates, false);
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
            const availableTrailer = await TrailersService.getAvailableTrailerByIdAndCompanyId(trailerIdOrData, companyId, cargoDates, false);
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


const validateCarDealItems = async (arr, companyId, cargoLoadingType, userLanguageId) => {
    const availableCars = [];
    const availableTrailers = [];
    const items = cargoLoadingType === LOADING_TYPES_MAP.FTL ? [...arr] : [arr[0]]; // use only first item for LTL (because drivers/cars/trailers the same for all items)
    const invalidItems = await Promise.all(items.map(async (item, i) => {
        const cargoId = item[HOMELESS_COLUMNS.CARGO_ID];
        const carIdOrData = item[HOMELESS_COLUMNS.CAR_ID_OR_DATA];
        const trailerIdOrData = item[HOMELESS_COLUMNS.TRAILER_ID_OR_DATA];
        const cargo = await CargosService.getRecordStrict(cargoId, userLanguageId);
        const cargoDates = formatCargoDates(cargo);

        if (isValidUUID(carIdOrData)) {
            const availableCar = await CarsService.getAvailableCarByIdAndCompanyId(carIdOrData, companyId, cargoDates, true);
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
            const availableTrailer = await TrailersService.getAvailableTrailerByIdAndCompanyId(trailerIdOrData, companyId, cargoDates, true);
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
    return [invalidItems.filter(Boolean), availableCars, availableTrailers];
};

const getDealsPaginationSorting = (companyId, limit, offset, sortColumn, asc, filter, userLanguageId) => (
    manyOrNone(selectDealsByCompanyIdPaginationSorting(companyId, limit, offset, sortColumn, asc, filter, userLanguageId))
);

const getCountDeals = (companyId, filter) => (
    one(selectCountDealsByCompanyId(companyId, filter))
        .then(({ count }) => +count)
);

const getDealsInProcessByRangeAndCarId = (carId, startDate, endDate) => (
    manyOrNone(selectDealsInProcessByRangeAndCarId(carId, startDate, endDate))
);

const checkOwnActiveDealExist = async (meta, dealId) => {
    const deal = await getRecord(dealId);
    const { companyId } = meta;
    return !!deal &&
        !FINISHED_STATUSES_LIST.includes(deal[HOMELESS_COLUMNS.DEAL_STATUS_NAME]) &&
        (deal[cols.TRANSPORTER_COMPANY_ID] === companyId || deal[colsCargos.COMPANY_ID] === companyId);
};

const checkNextStatusAllowed = async (meta, dealId) => {
    const deal = await getRecordStrict(dealId);

    const prevStatus = deal[HOMELESS_COLUMNS.DEAL_STATUS_NAME];
    const { nextStatus } = meta;

    return ALLOWED_NEXT_STATUSES_MAP[prevStatus].has(nextStatus);
};

module.exports = {
    addRecordsAsTransaction,
    editRecordAsTransaction,
    getRecordStrict,
    getRecordWithInstancesInfoStrict,
    validateDealItems,
    getDealsPaginationSorting,
    getCountDeals,
    getDealsInProcessByRangeAndCarId,

    checkOwnActiveDealExist,
    checkNextStatusAllowed,
    validateCarDealItems,
};
