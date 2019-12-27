const uuid = require('uuid/v4');
const { success, reject } = require('api/response');

// services
const CarPointsService = require('services/tables/car-points');
const DealService = require('services/tables/deals');
const TablesService = require('services/tables');

// constants
const { SUCCESS_CODES, ERROR_CODES } = require('constants/http-codes');
const { SQL_TABLES } = require('constants/tables');
const { PERMISSIONS } = require('constants/system');

// formatters
const CarPointsFormatters = require('formatters/car-points');

const colsDeals = SQL_TABLES.DEALS.COLUMNS;

const createTrackingPoint = async (req, res, next) => {
    try {
        const { user, permissions } = res.locals;
        const { dealId } = req.params;

        const deal = await DealService.getRecordStrict(dealId);
        const isDriver = deal[colsDeals.DRIVER_ID] = user.id;
        const hasPermissions = permissions.includes(PERMISSIONS.CREATE_CARGO_DEAL);

        if (isDriver || hasPermissions) {
            const coordinates = req.body.coordinate;
            const pointId = uuid();
            const newPoint = CarPointsFormatters.formatRecordToSave(
                pointId,
                dealId,
                deal[colsDeals.CAR_ID],
                deal[colsDeals.TRAILER_ID],
                coordinates,
            );
    
            const transactions = await CarPointsService.addPointOnTracking(newPoint);
    
            await TablesService.runTransaction(transactions);
    
            return success(res, { id: pointId }, SUCCESS_CODES.CREATED);
        }
        return reject(res, {}, {}, ERROR_CODES.FORBIDDEN);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTrackingPoint,
};
