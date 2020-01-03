const uuid = require('uuid/v4');
const { success } = require('api/response');

// services
const CarPointsService = require('services/tables/car-points');
const TrackingSocketHashesService = require('services/tables/tracking-socket-hashes');
const TablesService = require('services/tables');

// formatters
const CarPointsFormatters = require('formatters/car-points');
const TrackingSocketHashesFormatters = require('formatters/tracking-socket-hashes');

// constants
const { SQL_TABLES } = require('constants/tables');

const colsTracking = SQL_TABLES.TRACKING_SOCKET_HASHES.COLUMNS;

const getListDealPoints = async (req, res, next) => {
    try {
        const { user } = res.locals;
        const { dealId } = req.params;

        const points = await CarPointsService.getPointsByDealId(dealId);
        const result = points.map(point => CarPointsFormatters.formatPoinstForList(point));
        const hashRecord = TrackingSocketHashesFormatters.formatRecordToSave(
            user.id,
            dealId,
            uuid(),
        );
        const firstTransaction = await TrackingSocketHashesService.deleteRecordsByUser(user.id);
        await TablesService.runTransaction([firstTransaction]);

        const secondTransaction = await TrackingSocketHashesService.addRecordAsTransaction(hashRecord);
        await TablesService.runTransaction([secondTransaction]);

        return success(res, { points: result, hash: hashRecord[colsTracking.HASH], dealId });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getListDealPoints,
};
