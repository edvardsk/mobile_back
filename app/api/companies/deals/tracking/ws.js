const moment = require('moment');

// services
const CarPointsService = require('services/tables/car-points');
const TrackingSocketHashesService = require('services/tables/tracking-socket-hashes');

// formatters
const CarPointsFormatters = require('formatters/car-points');

// constants
const { SQL_TABLES } = require('constants/tables');

const colsTracking = SQL_TABLES.TRACKING_SOCKET_HASHES.COLUMNS;

const TIMEOUT_VALUE = process.env.SOCKET_TRACKING_TIMEOUT;

const getListDealPoints = async (ws, req) => {
    const { dealId } = req.params;
    const { hash } = req.query;

    const hashRecord = await TrackingSocketHashesService.getRecordByHash(hash);
    await TrackingSocketHashesService.deleteRecord(hashRecord.id);

    if (!hashRecord || hashRecord[colsTracking.DEAL_ID] !== dealId) {
        ws.terminate();
    } else {
        let latestDate = moment();
        let timeoutId;
        const timeoutHandler = () => {
            CarPointsService.getDealPointsAfterDate(dealId, latestDate.toISOString())
                .then(pointItems => {
                    const formattedPoints = pointItems.map(point => CarPointsFormatters.formatPoinstForList(point));
                    if(formattedPoints.length > 0) {
                        ws.send(JSON.stringify({ formattedPoints }));
                    }
                    timeoutId = setTimeout(timeoutHandler, TIMEOUT_VALUE);
                    latestDate = moment();
                });
        };
        timeoutId = setTimeout(timeoutHandler, TIMEOUT_VALUE);
        ws.on('close', () => {
            clearTimeout(timeoutId);
        });
    }
};

module.exports = {
    getListDealPoints,
};
