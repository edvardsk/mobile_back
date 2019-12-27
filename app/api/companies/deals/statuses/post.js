const { success, reject } = require('api/response');

// services
const DealsService = require('services/tables/deals');
const CargoPointsService = require('services/tables/cargo-points');

// constants
const { SQL_TABLES } = require('constants/tables');
const { ERRORS } = require('constants/errors');

// formatters
const DealsFormatters = require('formatters/deals');
const CargoPointsFormatters = require('formatters/cargo-points');

// helpers
const { validateDealInstancesToConfirmedStatus } = require('helpers/validators/deals');

const colsDeals = SQL_TABLES.DEALS.COLUMNS;
const colsCargos = SQL_TABLES.CARGOS.COLUMNS;

const setConfirmedStatus = async (req, res, next) => {
    try {
        const { company } = res.locals;
        const { body } = req;
        const { dealId } = req.params;
        const deal = await DealsService.getRecordWithInstancesInfoStrict(dealId);

        const transporterCompanyId = deal[colsDeals.TRANSPORTER_COMPANY_ID];
        const holderCompanyId = deal[colsCargos.COMPANY_ID];

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

        } else {
            return reject(res, ERRORS.SYSTEM.ERROR);
        }

        return success(res, {});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    setConfirmedStatus,
};
