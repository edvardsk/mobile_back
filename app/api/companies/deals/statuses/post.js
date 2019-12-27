const uuid = require('uuid/v4');

const { success, reject } = require('api/response');

// services
const DealsService = require('services/tables/deals');
const CargoPointsService = require('services/tables/cargo-points');
const DealPointsInfoService = require('services/tables/deal-points-info');
const DealsStatusesServices = require('services/tables/deal-statuses');
const DealsStatusesHistoryServices = require('services/tables/deal-statuses-history');
const FilesService = require('services/tables/files');
const DealsFilesService = require('services/tables/deals-to-files');
const DealStatusesConfirmationsService = require('services/tables/deal-statuses-history-confirmations');
const TablesService = require('services/tables');
const S3Service = require('services/aws/s3');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const { DEAL_STATUSES_MAP } = require('constants/deal-statuses');

// formatters
const DealsFormatters = require('formatters/deals');
const CargoPointsFormatters = require('formatters/cargo-points');
const DealPointsInfoFormatters = require('formatters/deal-points-info');
const FilesFormatters = require('formatters/files');
const DealStatusesHistoryFormatters = require('formatters/deal-statuses-history');

// helpers
const { validateDealInstancesToConfirmedStatus } = require('helpers/validators/deals');

const colsDeals = SQL_TABLES.DEALS.COLUMNS;
const colsCargos = SQL_TABLES.CARGOS.COLUMNS;
const colsDealHistoryConfirmations = SQL_TABLES.DEAL_STATUSES_HISTORY_CONFIRMATIONS.COLUMNS;

const setConfirmedStatus = async (req, res, next) => {
    try {
        const { company, user } = res.locals;
        const { body, files } = req;
        const { dealId } = req.params;
        const deal = await DealsService.getRecordWithInstancesInfoStrict(dealId);

        const transporterCompanyId = deal[colsDeals.TRANSPORTER_COMPANY_ID];
        const holderCompanyId = deal[colsCargos.COMPANY_ID];

        const transactionsList = [];
        let filesToStore = [];

        if (transporterCompanyId === company.id) {
            // todo: add driver after using forwarder role
        } else if (holderCompanyId === company.id) {
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
                    FilesService.addFilesAsTransaction(dbFiles)
                );
                transactionsList.push(
                    DealsFilesService.addRecordsAsTransaction(dbDealsFiles)
                );
            }

            if (deal[colsDealHistoryConfirmations.CONFIRMED_BY_TRANSPORTER]) { // move to next step
                const id = deal[HOMELESS_COLUMNS.DEAL_STATUS_CONFIRMATION_ID];
                transactionsList.push(
                    DealStatusesConfirmationsService.editRecordAsTransaction(id, {
                        [colsDealHistoryConfirmations.CONFIRMED_BY_HOLDER]: true,
                    })
                );

                const confirmedDealStatusId = await DealsStatusesServices.getRecordStrict(DEAL_STATUSES_MAP.CONFIRMED);
                const dealStatusHistoryId = uuid();

                const statusHistory = DealStatusesHistoryFormatters.formatRecordsToSave(dealStatusHistoryId, dealId, confirmedDealStatusId.id, user.id);

                transactionsList.push(
                    DealsStatusesHistoryServices.addRecordAsTransaction(statusHistory)
                );

            }

        } else {
            return reject(res, ERRORS.SYSTEM.ERROR);
        }

        await TablesService.runTransaction(transactionsList);

        await Promise.all(filesToStore.map(({ bucket, path, data, contentType }) => {
            return S3Service.putObject(bucket, path, data, contentType);
        }));

        return success(res, {});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    setConfirmedStatus,
};
