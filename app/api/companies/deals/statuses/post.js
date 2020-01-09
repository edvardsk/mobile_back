const uuid = require('uuid/v4');
const moment = require('moment');

const { success, reject } = require('api/response');

// services
const DealsService = require('services/tables/deals');
const CarsService = require('services/tables/cars');
const DriversService = require('services/tables/drivers');
const TrailersService = require('services/tables/trailers');
const CargosService = require('services/tables/cargos');
const CargoPointsService = require('services/tables/cargo-points');
const DealPointsInfoService = require('services/tables/deal-points-info');
const DealsStatusesServices = require('services/tables/deal-statuses');
const DealsStatusesHistoryServices = require('services/tables/deal-statuses-history');
const DealFilesService = require('services/tables/deal-files');
const DealsToDealFilesService = require('services/tables/deals-to-deals-files');
const DealStatusesConfirmationsService = require('services/tables/deal-statuses-history-confirmations');
const TablesService = require('services/tables');
const S3Service = require('services/aws/s3');
const PgJobService = require('services/pg-jobs');
const BackgroundService = require('services/background/creators');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const {
    DEAL_STATUSES_MAP,
    DEAL_ROUTES_TO_STATUSES_MAP,
    STATUSES_TO_CREATE_CONFIRMATION_RECORD_SET,
    STATUSES_TO_STORE_DEAL_INSTANCES_SET,
} = require('constants/deal-statuses');
const { ACTION_TYPES } = require('constants/background');
const { LOADING_TYPES_MAP } = require('constants/cargos');
const { CAR_TYPES_MAP } = require('constants/cars');
const { SUCCESS_CODES } = require('constants/http-codes');

// formatters
const DealsFormatters = require('formatters/deals');
const CargosFormatters = require('formatters/cargos');
const CargoPointsFormatters = require('formatters/cargo-points');
const DealPointsInfoFormatters = require('formatters/deal-points-info');
const FilesFormatters = require('formatters/files');
const DealStatusesHistoryFormatters = require('formatters/deal-statuses-history');
const DealStatusHistoryConfirmationFormatters = require('formatters/deal-status-history-confirmations');

// helpers
const { validateDealInstancesToConfirmedStatus } = require('helpers/validators/deals');

const colsDeals = SQL_TABLES.DEALS.COLUMNS;
const colsCars = SQL_TABLES.CARS.COLUMNS;
const colsTrailers = SQL_TABLES.TRAILERS.COLUMNS;
const colsCargos = SQL_TABLES.CARGOS.COLUMNS;
const colsDealHistoryConfirmations = SQL_TABLES.DEAL_STATUSES_HISTORY_CONFIRMATIONS.COLUMNS;

const {
    SET_GOING_TO_UPLOAD_DEAL_STATUS_UNIT,
    SET_GOING_TO_UPLOAD_DEAL_STATUS_VALUE,
} = process.env;

const setConfirmedStatus = async (req, res, next) => {
    try {
        const { company, user } = res.locals;
        const { body, files } = req;
        const { dealId } = req.params;
        const deal = await DealsService.getRecordWithInstancesInfoStrict(dealId);

        const transporterCompanyId = deal[colsDeals.TRANSPORTER_COMPANY_ID];
        const holderCompanyId = deal[colsCargos.COMPANY_ID];
        const confirmedByTransporter = deal[colsDealHistoryConfirmations.CONFIRMED_BY_TRANSPORTER];
        const dealStatusConfirmationId = deal[HOMELESS_COLUMNS.DEAL_STATUS_CONFIRMATION_ID];
        const cargoStartUploadingDate = deal[colsCargos.UPLOADING_DATE_FROM];
        let timeToSetNextStatus = moment(cargoStartUploadingDate)
            .subtract(+SET_GOING_TO_UPLOAD_DEAL_STATUS_VALUE, SET_GOING_TO_UPLOAD_DEAL_STATUS_UNIT)
            .toISOString();

        const transactionsList = [];
        let filesToStore = [];

        let enableJobToSetNextStatus = false;

        if (transporterCompanyId === company.id) {
            const driverId = body[HOMELESS_COLUMNS.DRIVER_ID];
            const cargoDates = CargosFormatters.formatCargoDates(deal);
            const availableDriver = await DriversService.getAvailableDriverByIdAndCompanyId(driverId, company.id, cargoDates);
            if (!availableDriver) {
                return reject(res, ERRORS.DEALS.AVAILABLE_DRIVER_IS_NOT_FOUND);
            }

            transactionsList.push(
                DealsService.editRecordAsTransaction(dealId, {
                    [colsDeals.DRIVER_ID]: driverId,
                })
            );

            const dealStatusConfirmationId = deal[HOMELESS_COLUMNS.DEAL_STATUS_CONFIRMATION_ID];
            transactionsList.push(
                DealStatusesConfirmationsService.editRecordAsTransaction(dealStatusConfirmationId, {
                    [colsDealHistoryConfirmations.CONFIRMED_BY_TRANSPORTER]: true,
                })
            );

        } else if (holderCompanyId === company.id) {
            if (!confirmedByTransporter) {
                return reject(res, ERRORS.DEALS.WAIT_FOR_CONFIRM_FROM_TRANSPORTER_FIRST);
            }
            const cargoId = deal[colsDeals.CARGO_ID];
            const cargoPoints = await CargoPointsService.getRecordsByCargoId(cargoId);

            const [uploadingPointsInfo, downloadingPointsInfo] = DealsFormatters.separatePointsInConfirmedRequest(body);

            const [uploadingPoints, downloadingPoints] = CargoPointsFormatters.separatePointsByType(cargoPoints);

            const invalidUploadingPoints = uploadingPoints.filter(point => {
                const pointInfo = uploadingPointsInfo[point.id];
                return !pointInfo || Object.keys(pointInfo).length !== 3;
            });

            if (invalidUploadingPoints.length) {
                return reject(res, ERRORS.DEALS.INVALID_UPLOADING_POINTS_INFO);
            }

            const invalidDownloadingPoints = downloadingPoints.filter(point => {
                const pointInfo = downloadingPointsInfo[point.id];
                return !pointInfo || Object.keys(pointInfo).length !== 3;
            });

            if (invalidDownloadingPoints.length) {
                return reject(res, ERRORS.DEALS.INVALID_DOWNLOADING_POINTS_INFO);
            }

            const dealsErrors = validateDealInstancesToConfirmedStatus(deal);

            if (dealsErrors.length) {
                return reject(res, ERRORS.DEALS.INSTANCES_ERROR, dealsErrors);
            }

            const carId = deal[colsDeals.CAR_ID];
            const trailerId = deal[colsDeals.TRAILER_ID];
            const [car, trailer] = await Promise.all([
                CarsService.getRecordStrict(carId),
                trailerId && TrailersService.getRecordStrict(trailerId),
            ]);

            const isCarAbleTransport = car[colsCars.CAR_TYPE] === CAR_TYPES_MAP.TRUCK;
            const carWidth = parseFloat(car[colsCars.CAR_WIDTH]) || 0;
            const carLength = parseFloat(car[colsCars.CAR_LENGTH]) || 0;
            const carHeight = parseFloat(car[colsCars.CAR_HEIGHT]) || 0;
            const carCarryingCapacity = parseFloat(car[colsCars.CAR_CARRYING_CAPACITY]) || 0;

            const trailerWidth = trailer ? parseFloat(trailer[colsTrailers.TRAILER_WIDTH]) : 0;
            const trailerLength = trailer ? parseFloat(trailer[colsTrailers.TRAILER_LENGTH]) : 0;
            const trailerHeight = trailer ? parseFloat(trailer[colsTrailers.TRAILER_HEIGHT]) : 0;
            const trailerCarryingCapacity = trailer ? parseFloat(trailer[colsTrailers.TRAILER_CARRYING_CAPACITY]) : 0;

            const currentCargoWidth = parseFloat(deal[colsCargos.WIDTH]);
            const currentCargoLength = parseFloat(deal[colsCargos.LENGTH]);
            const currentCargoHeight = parseFloat(deal[colsCargos.HEIGHT]);
            const currentCargoGrossWeight = parseFloat(deal[colsCargos.GROSS_WEIGHT]);
            const currentCargoVolume = currentCargoWidth * currentCargoLength * currentCargoHeight;

            const widthSizes = [];
            const heightSizes = [];

            if (isCarAbleTransport) {
                widthSizes.push(carWidth);
                heightSizes.push(carHeight);
            }
            if (trailer) {
                widthSizes.push(trailerWidth);
                heightSizes.push(trailerHeight);
            }
            if (!isCarAbleTransport && !trailer) {
                return reject(res, ERRORS.DEALS.CARGO_DOES_NOT_SUIT);
            }

            const minTransportWidth = Math.min(...widthSizes);
            const minTransportHeight = Math.min(...heightSizes);
            const transportLength = carLength + trailerLength;
            const transportVolume = carLength * carHeight * carWidth + trailerLength * trailerHeight * trailerWidth;
            const transportCarryingCapacity = carCarryingCapacity + trailerCarryingCapacity;

            const cargoLoadingType = deal[colsCargos.LOADING_TYPE];

            if (
                minTransportWidth < currentCargoWidth ||
                minTransportHeight < currentCargoHeight ||
                transportLength < currentCargoLength
            ) {
                return reject(res, ERRORS.DEALS.CARGO_DOES_NOT_SUIT);
            }

            let sumGrossWeight = currentCargoGrossWeight;
            let sumVolume = currentCargoVolume;

            if (cargoLoadingType === LOADING_TYPES_MAP.LTL) {
                const dealStartDate = new Date(deal[colsCargos.UPLOADING_DATE_FROM]).toISOString();
                const dealEndDate = new Date(deal[colsCargos.DOWNLOADING_DATE_TO]).toISOString();
                const sameTimeDeals = await DealsService.getDealsInProcessByRangeAndCarId(carId, dealStartDate, dealEndDate);
                const [cargosVolume, cargosWeight] = sameTimeDeals.reduce((acc, deal) => {
                    const [volume, weight] = acc;
                    const length = parseFloat(deal[colsCargos.LENGTH]);
                    const height = parseFloat(deal[colsCargos.HEIGHT]);
                    const width = parseFloat(deal[colsCargos.WIDTH]);
                    const grossWeight = parseFloat(deal[colsCargos.GROSS_WEIGHT]);
                    return [volume + length * height * width, weight + grossWeight];
                }, [currentCargoVolume, currentCargoGrossWeight]);

                sumGrossWeight = cargosWeight;
                sumVolume = cargosVolume;
            }

            if (
                transportCarryingCapacity < sumGrossWeight ||
                transportVolume < sumVolume
            ) {
                // remove cargo
                return reject(res, ERRORS.DEALS.CARGO_DOES_NOT_SUIT);
            }

            const dataToEditDeal = DealsFormatters.formatRecordToEditDataForConfirmedStatusForHolder(body);
            transactionsList.push(
                DealsService.editRecordAsTransaction(deal.id, dataToEditDeal)
            );

            const upDataToAddDealPointsInfo = DealPointsInfoFormatters.formatRecordsToSave(deal.id, uploadingPointsInfo);
            const downDataToAddDealPointsInfo = DealPointsInfoFormatters.formatRecordsToSave(deal.id, downloadingPointsInfo);
            transactionsList.push(
                DealPointsInfoService.addRecordsAsTransaction([
                    ...upDataToAddDealPointsInfo,
                    ...downDataToAddDealPointsInfo,
                ])
            );

            if (Object.keys(files).length) {
                const [dbFiles, dbDealsFiles, storageFiles] = FilesFormatters.prepareFilesToStoreForDeals(files, dealId);
                filesToStore = [
                    ...filesToStore,
                    ...storageFiles,
                ];
                transactionsList.push(
                    DealFilesService.addFilesAsTransaction(dbFiles)
                );
                transactionsList.push(
                    DealsToDealFilesService.addRecordsAsTransaction(dbDealsFiles)
                );
            }

            transactionsList.push(
                DealStatusesConfirmationsService.editRecordAsTransaction(dealStatusConfirmationId, {
                    [colsDealHistoryConfirmations.CONFIRMED_BY_HOLDER]: true,
                })
            );

            const confirmedDealStatus = await DealsStatusesServices.getRecordStrict(DEAL_STATUSES_MAP.CONFIRMED);
            const dealStatusHistoryId = uuid();

            const statusHistory = DealStatusesHistoryFormatters.formatRecordsToSave(dealStatusHistoryId, dealId, confirmedDealStatus.id, user.id);

            transactionsList.push(
                DealsStatusesHistoryServices.addRecordAsTransaction(statusHistory)
            );

            transactionsList.push(
                PgJobService.removeRecordByNameAndDataPathAsTransaction(ACTION_TYPES.AUTO_CANCEL_UNCONFIRMED_DEAL, dealId)
            );

            enableJobToSetNextStatus = true;
            if (moment(timeToSetNextStatus) < moment()) { // set next status immediately
                timeToSetNextStatus = 0;
            }

        } else {
            return reject(res, ERRORS.SYSTEM.ERROR);
        }

        await TablesService.runTransaction(transactionsList);

        if (enableJobToSetNextStatus) {
            await BackgroundService.autoSetGoingToUploadDealStatusCreator(dealId, timeToSetNextStatus);
        }

        await Promise.all(filesToStore.map(({ bucket, path, data, contentType }) => {
            return S3Service.putObject(bucket, path, data, contentType);
        }));

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

const setCancelledStatus = async (req, res, next) => {
    try {
        const { user } = res.locals;
        const { dealId } = req.params;
        const comment = req.body[HOMELESS_COLUMNS.COMMENT];

        const [deal, failedDealStatus] = await Promise.all([
            DealsService.getRecordStrict(dealId),
            DealsStatusesServices.getRecordStrict(DEAL_STATUSES_MAP.CANCELLED),
        ]);
        const dealStatusHistoryId = uuid();

        const statusHistory = DealStatusesHistoryFormatters.formatRecordsToSave(dealStatusHistoryId, dealId, failedDealStatus.id, user.id, comment);

        let transactionsList = [
            DealsStatusesHistoryServices.addRecordAsTransaction(statusHistory),
            CargosService.editRecordIncreaseFreeCountAsTransaction(deal[colsDeals.CARGO_ID], 1),
            PgJobService.removeRecordByNameAndDataPathAsTransaction(ACTION_TYPES.AUTO_CANCEL_UNCONFIRMED_DEAL, dealId)
        ];

        const [transactions, filesToCopy] = await DealsService.saveLatestDealInstances(deal);

        transactionsList = [
            ...transactionsList,
            ...transactions,
        ];

        await TablesService.runTransaction(transactionsList);

        if (filesToCopy.length) {
            await Promise.all(filesToCopy.map(({ bucket, oldPath, newPath }) => (
                S3Service.copyObject(bucket, oldPath, newPath)
            )));
        }

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

const setRejectedStatus = async (req, res, next) => {
    try {
        const { user } = res.locals;
        const { dealId } = req.params;
        const comment = req.body[HOMELESS_COLUMNS.COMMENT];

        const [deal, failedDealStatus] = await Promise.all([
            DealsService.getRecordStrict(dealId),
            DealsStatusesServices.getRecordStrict(DEAL_STATUSES_MAP.REJECTED),
        ]);
        const dealStatusHistoryId = uuid();

        const statusHistory = DealStatusesHistoryFormatters.formatRecordsToSave(dealStatusHistoryId, dealId, failedDealStatus.id, user.id, comment);

        let transactionsList = [
            DealsStatusesHistoryServices.addRecordAsTransaction(statusHistory),
            CargosService.editRecordIncreaseFreeCountAsTransaction(deal[colsDeals.CARGO_ID], 1),
            PgJobService.removeRecordByNameAndDataPathAsTransaction(ACTION_TYPES.AUTO_SET_GOING_TO_UPLOAD_DEAL_STATUS, dealId),
        ];

        const [transactions, filesToCopy] = await DealsService.saveLatestDealInstances(deal);

        transactionsList = [
            ...transactionsList,
            ...transactions,
        ];

        await TablesService.runTransaction(transactionsList);

        if (filesToCopy.length) {
            await Promise.all(filesToCopy.map(({ bucket, oldPath, newPath }) => (
                S3Service.copyObject(bucket, oldPath, newPath)
            )));
        }

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

const setFailedStatus = async (req, res, next) => {
    try {
        const { user } = res.locals;
        const { dealId } = req.params;
        const comment = req.body[HOMELESS_COLUMNS.COMMENT];

        const [deal, failedDealStatus] = await Promise.all([
            DealsService.getRecordStrict(dealId),
            DealsStatusesServices.getRecordStrict(DEAL_STATUSES_MAP.FAILED),
        ]);

        const dealStatusHistoryId = uuid();

        const statusHistory = DealStatusesHistoryFormatters.formatRecordsToSave(dealStatusHistoryId, dealId, failedDealStatus.id, user.id, comment);

        let filesToCopy = [];
        let transactionsList = [
            DealsStatusesHistoryServices.addRecordAsTransaction(statusHistory),
        ];

        const currentDealStatus = deal[HOMELESS_COLUMNS.DEAL_STATUS_NAME];
        if (STATUSES_TO_STORE_DEAL_INSTANCES_SET.has(currentDealStatus)) {
            const [transactions, copyFiles] = await DealsService.saveLatestDealInstances(deal);

            transactionsList = [
                ...transactionsList,
                ...transactions,
            ];

            filesToCopy = [
                ...filesToCopy,
                ...copyFiles,
            ];
        }

        await TablesService.runTransaction(transactionsList);

        if (filesToCopy.length) {
            await Promise.all(filesToCopy.map(({ bucket, oldPath, newPath }) => (
                S3Service.copyObject(bucket, oldPath, newPath)
            )));
        }

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

const setDoubleConfirmedStatus = async (req, res, next) => {
    try {
        const { user, nextStatus, isTransporter } = res.locals;
        const { dealId } = req.params;

        let transactionsList = [];
        let filesToCopy = [];

        const statusToSet = DEAL_ROUTES_TO_STATUSES_MAP[nextStatus];

        if (!statusToSet) {
            return reject(res, ERRORS.SYSTEM.ERROR);
        }

        const deal = await DealsService.getRecordStrict(dealId);

        const confirmedByTransporter = deal[colsDealHistoryConfirmations.CONFIRMED_BY_TRANSPORTER];
        const confirmedByHolder = deal[colsDealHistoryConfirmations.CONFIRMED_BY_HOLDER];
        const dealStatusConfirmationId = deal[HOMELESS_COLUMNS.DEAL_STATUS_CONFIRMATION_ID];

        const updatedStatusHistoryConfirmation = DealStatusHistoryConfirmationFormatters.formatRecordToConfirmBySomeRole(isTransporter);

        transactionsList.push(
            DealStatusesConfirmationsService.editRecordAsTransaction(dealStatusConfirmationId, updatedStatusHistoryConfirmation)
        );

        if (confirmedByTransporter || confirmedByHolder) { // set next status
            const nextDealStatus = await DealsStatusesServices.getRecordStrict(statusToSet);

            const dealStatusHistoryId = uuid();

            const statusHistory = DealStatusesHistoryFormatters.formatRecordsToSave(dealStatusHistoryId, dealId, nextDealStatus.id, user.id);
            transactionsList.push(
                DealsStatusesHistoryServices.addRecordAsTransaction(statusHistory)
            );

            if (STATUSES_TO_CREATE_CONFIRMATION_RECORD_SET.has(statusToSet)) {
                const statusHistoryConfirmation = DealStatusHistoryConfirmationFormatters.formatRecordToSave(dealStatusHistoryId);
                transactionsList.push(
                    DealStatusesConfirmationsService.addRecordAsTransaction(statusHistoryConfirmation)
                );
            }

            if (statusToSet === DEAL_STATUSES_MAP.DONE) { // set constant deal instances (cars/trailers/drivers)
                const [transactions, copyFiles] = await DealsService.saveLatestDealInstances(deal);

                transactionsList = [
                    ...transactionsList,
                    ...transactions,
                ];

                filesToCopy = [
                    ...filesToCopy,
                    ...copyFiles,
                ];
            }
        }

        await TablesService.runTransaction(transactionsList);

        if (filesToCopy.length) {
            await Promise.all(filesToCopy.map(({ bucket, oldPath, newPath }) => (
                S3Service.copyObject(bucket, oldPath, newPath)
            )));
        }

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

const setHolderSentPaymentStatus = async (req, res, next) => {
    try {
        const { user } = res.locals;
        const { dealId } = req.params;

        const transactionsList = [];

        const nextDealStatus = await DealsStatusesServices.getRecordStrict(DEAL_STATUSES_MAP.WAIT_TRANSPORTER_PAYMENT);

        const dealStatusHistoryId = uuid();
        const statusHistory = DealStatusesHistoryFormatters.formatRecordsToSave(dealStatusHistoryId, dealId, nextDealStatus.id, user.id);
        transactionsList.push(
            DealsStatusesHistoryServices.addRecordAsTransaction(statusHistory)
        );

        await TablesService.runTransaction(transactionsList);

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    setConfirmedStatus,
    setCancelledStatus,
    setRejectedStatus,
    setFailedStatus,
    setDoubleConfirmedStatus,
    setHolderSentPaymentStatus,
};
