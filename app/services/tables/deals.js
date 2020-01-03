const uuid = require('uuid/v4');
const { isEmpty } = require('lodash');

const  { one, oneOrNone, manyOrNone } = require('db');

// sql-helpers
const {
    insertRecords,
    updateRecord,
    selectDealsByCompanyIdPaginationSorting,
    selectCountDealsByCompanyId,
    selectFullRecordById,
    selectRecordById,
    selectRecordWithInstancesInfoById,
    selectDealsInProcessByRangeAndCarId,
} = require('sql-helpers/deals');

// services
const UsersService = require('./users');
const DriversService = require('./drivers');
const CarsService = require('./cars');
const TrailersService = require('./trailers');
const CargosService = require('./cargos');
const FilesService = require('./files');
const DealDriversService = require('./deal-drivers');
const DealCarsService = require('./deal-cars');
const DealTrailersService = require('./deal-trailers');
const DealFilesService = require('./deal-files');
const DealCarsFilesService = require('./deal-cars-to-deal-files');
const DealTrailersFilesService = require('./deal-trailers-to-deal-files');
const DealDriversFilesService = require('./deal-drivers-to-deal-files');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const { OPERATIONS } = require('constants/postgres');
const { LOADING_TYPES_MAP } = require('constants/cargos');
const { FINISHED_STATUSES_LIST, ALLOWED_NEXT_STATUSES_MAP } = require('constants/deal-statuses');
const { ENTITIES } = require('constants/index');

// helpers
const { isValidUUID } = require('helpers/validators');

// formatters
const CargosFormatters = require('formatters/cargos');
const DealFilesFormatters = require('formatters/deal-files');
const DealCarsFormatters = require('formatters/deal-cars');
const DealTrailersFormatters = require('formatters/deal-trailers');
const DealDriversFormatters = require('formatters/deal-drivers');

const cols = SQL_TABLES.DEALS.COLUMNS;
const colsCargos = SQL_TABLES.CARGOS.COLUMNS;
const colsDrivers = SQL_TABLES.DRIVERS.COLUMNS;

const addRecordsAsTransaction = values => [insertRecords(values), OPERATIONS.MANY];

const getRecordStrict = id => one(selectRecordById(id));

const editRecordAsTransaction = (id, data) => [updateRecord(id, data), OPERATIONS.ONE];

const getRecordWithInstancesInfoStrict = id => one(selectRecordWithInstancesInfoById(id));

const getRecord = id => oneOrNone(selectRecordById(id));

const getFullRecordStrict = (id, userLanguageId) => one(selectFullRecordById(id, userLanguageId));

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
        const cargoDates = CargosFormatters.formatCargoDates(cargo);

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
        const cargoDates = CargosFormatters.formatCargoDates(cargo);

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

const saveLatestDealInstances = async deal => {
    let transactions = [];
    let filesToCopy = [];
    const updateDeal = {};

    const carId = deal[cols.CAR_ID];
    const trailerId = deal[cols.TRAILER_ID];
    const driverId = deal[cols.DRIVER_ID];

    const [car, trailer, driver] = await Promise.all([
        carId && CarsService.getRecordStrict(carId),
        trailerId && TrailersService.getRecordStrict(trailerId),
        driverId && DriversService.getRecordStrict(driverId),
    ]);

    const userId = !!driver && driver[colsDrivers.USER_ID];

    const user = userId && await UsersService.getUserWithRoleAndPhoneNumber(userId);

    const [carFiles, trailerFiles, driverFiles] = await Promise.all([
        car && FilesService.getFilesByCarId(carId) || [],
        trailer && FilesService.getFilesByTrailerId(trailerId) || [],
        driver && FilesService.getFilesByUserId(driver[colsDrivers.USER_ID]) || [],
    ]);

    const [carFilesDecrypted, trailerFilesDecrypted, driverFilesDecrypted] = await Promise.all([
        DealFilesService.formatDataWithDecryptedUrl(carFiles),
        DealFilesService.formatDataWithDecryptedUrl(trailerFiles),
        DealFilesService.formatDataWithDecryptedUrl(driverFiles),
    ]);

    if (carId) {
        const dealCarId = uuid();
        updateDeal[cols.DEAL_CAR_ID] = dealCarId;

        const dealCar = DealCarsFormatters.formatRecordToSaveFromOriginal(dealCarId, car);

        transactions.push(
            DealCarsService.addRecordAsTransaction(dealCar)
        );

        const [
            carDealFiles, carsToDealsFiles, carCopyFiles
        ] = DealFilesFormatters.prepareFilesToStoreForCarsFromOriginal(ENTITIES.CAR, carFilesDecrypted, dealCarId, deal.id);
        filesToCopy = [
            ...filesToCopy,
            ...carCopyFiles,
        ];

        transactions.push(
            DealFilesService.addFilesAsTransaction(carDealFiles)
        );
        transactions.push(
            DealCarsFilesService.addRecordsAsTransaction(carsToDealsFiles)
        );
    }

    if (trailerFilesDecrypted.length) {
        const dealTrailerId = uuid();
        updateDeal[cols.DEAL_TRAILER_ID] = dealTrailerId;

        const dealTrailer = DealTrailersFormatters.formatRecordToSaveFromOriginal(dealTrailerId, trailer);

        transactions.push(
            DealTrailersService.addRecordAsTransaction(dealTrailer)
        );

        const [
            trailerDealFiles, trailersToDealsFiles, trailerCopyFiles
        ] = DealFilesFormatters.prepareFilesToStoreForCarsFromOriginal(ENTITIES.TRAILER, trailerFilesDecrypted, dealTrailerId, deal.id);
        filesToCopy = [
            ...filesToCopy,
            ...trailerCopyFiles,
        ];

        transactions.push(
            DealFilesService.addFilesAsTransaction(trailerDealFiles)
        );
        transactions.push(
            DealTrailersFilesService.addRecordsAsTransaction(trailersToDealsFiles)
        );
    }

    if (driverFilesDecrypted.length) {
        const dealDriverId = uuid();
        updateDeal[cols.DEAL_DRIVER_ID] = dealDriverId;

        const dealDriver = DealDriversFormatters.formatRecordToSaveFromOriginal(dealDriverId, user, driver);

        transactions.push(
            DealDriversService.addRecordAsTransaction(dealDriver)
        );

        const [
            driverDealFiles, driversToDealsFiles, driverCopyFiles
        ] = DealFilesFormatters.prepareFilesToStoreForCarsFromOriginal(ENTITIES.DRIVER, driverFilesDecrypted, dealDriverId, deal.id);
        filesToCopy = [
            ...filesToCopy,
            ...driverCopyFiles,
        ];

        transactions.push(
            DealFilesService.addFilesAsTransaction(driverDealFiles)
        );
        transactions.push(
            DealDriversFilesService.addRecordsAsTransaction(driversToDealsFiles)
        );
    }

    if (!isEmpty(updateDeal)) {
        transactions.push(
            editRecordAsTransaction(deal.id, updateDeal)
        );
    }

    return [transactions, filesToCopy];
};

const checkOwnActiveDealExist = async (meta, dealId) => {
    const deal = await getRecord(dealId);
    const { companyId } = meta;
    return !!deal &&
        !FINISHED_STATUSES_LIST.includes(deal[HOMELESS_COLUMNS.DEAL_STATUS_NAME]) &&
        (deal[cols.TRANSPORTER_COMPANY_ID] === companyId || deal[colsCargos.COMPANY_ID] === companyId);
};

const checkOwnDealExist = async (meta, dealId) => {
    const deal = await getRecord(dealId);
    const { companyId } = meta;
    return !!deal && (deal[cols.TRANSPORTER_COMPANY_ID] === companyId || deal[colsCargos.COMPANY_ID] === companyId);
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
    getFullRecordStrict,
    getRecordStrict,
    getRecordWithInstancesInfoStrict,
    validateDealItems,
    getDealsPaginationSorting,
    getCountDeals,
    getDealsInProcessByRangeAndCarId,
    saveLatestDealInstances,

    checkOwnActiveDealExist,
    checkOwnDealExist,
    checkNextStatusAllowed,
    validateCarDealItems,
};
