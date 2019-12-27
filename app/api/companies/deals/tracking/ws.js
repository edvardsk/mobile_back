const moment = require('moment');

// services
const CarPointsService = require('services/tables/car-points');
const TrackingSocketHashesService = require('services/tables/tracking-socket-hashes');
const TablesService = require('services/tables');

// formatters
const CarPointsFormatters = require('formatters/car-points');

// constants
const { SQL_TABLES } = require('constants/tables');

const colsTracking = SQL_TABLES.TRACKING_SOCKET_HASHES.COLUMNS;

const TIMEOUT_VALUE = 3000;

const getListDealPoints = async (ws, req) => {
    const { dealId } = req.params;
    const { hash } = req.query;

    const hashRecord = await TrackingSocketHashesService.getRecordByHash(hash);
    await TablesService.runTransaction(await TrackingSocketHashesService.deleteRecord(hashRecord.id));

    if (!hashRecord || hashRecord[colsTracking.DEAL_ID] !== dealId) {
        ws.terminate();
    } else {
        let latestDate = moment.now();
        let timeoutId;
        const timeoutHandler = () => {
            latestDate = moment.now();
            CarPointsService.getDealPointsAfterDate(dealId, latestDate.toISOString())
                .then(pointItems => {
                    const formattedpoints = pointItems.map(point => CarPointsFormatters.formatPoinstForList(point));
                    ws.message(JSON.stringify({ formattedpoints }));
                });
        };
        ws.onopen(() => {
            timeoutId = setTimeout(timeoutHandler, TIMEOUT_VALUE);
        });
        ws.onClose(() => {
            clearTimeout(timeoutId);
        });
    }
};

module.exports = {
    getListDealPoints,
};
