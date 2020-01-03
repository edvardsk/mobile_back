const uuid = require('uuid/v4');

// services
const TrackingSocketHashesService = require('services/tables/tracking-socket-hashes');
const WebSocketService = require('services/ws');

// constants
const { SQL_TABLES } = require('constants/tables');

const colsTracking = SQL_TABLES.TRACKING_SOCKET_HASHES.COLUMNS;

const getListDealPoints = async (ws, req) => {
    const { dealId } = req.params;
    const { hash } = req.query;

    const hashRecord = await TrackingSocketHashesService.getRecordByHash(hash);
    await TrackingSocketHashesService.deleteRecord(hashRecord.id);

    if (!hashRecord || hashRecord[colsTracking.DEAL_ID] !== dealId) {
        ws.terminate();
    } else {
        let handlerId = uuid();
        const handler = (newPoints) =>{
            if(newPoints.length > 0) {
                ws.send(JSON.stringify({ formattedPoints: newPoints }));
            }
        };
        WebSocketService.addWebsocketHandler(dealId, handlerId, handler);
        ws.on('close', () => {
            WebSocketService.removeWebsocketHandler(dealId, handlerId);
        });
    }
};

module.exports = {
    getListDealPoints,
};
