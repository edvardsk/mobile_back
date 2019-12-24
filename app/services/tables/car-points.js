const { oneOrNone } = require('db');
const uuid = require('uuid/v4');

// sql-helpers
const {
    insertRecord,
    selectLatestRecordByCarId,
    selectLatestRecordByTrailerId,
} = require('sql-helpers/car-points');

// formatters
const { 
    formatRecordToSave,
} = require('formatters/car-points');
const { 
    formatRecordToSave: formatLatestPointToSave,
} = require('formatters/car-latest-points');

// services
const CarLatestPoints = require('./car-latest-points');

// constants
const { OPERATIONS } = require('constants/postgres');
const { SQL_TABLES } = require('constants/tables');

const colPoints = SQL_TABLES.CAR_POINTS.COLUMNS;

const addRecordAsTransaction = value => [insertRecord(value), OPERATIONS.ONE];

const getRecordByCarId = carId => oneOrNone(selectLatestRecordByCarId(carId));

const getRecordByTrailerId = carId => oneOrNone(selectLatestRecordByTrailerId(carId));

const addPointOnLinking = async (carId, trailerId) => {
    const previousPoint = await getRecordByCarId(carId);
    const newPoint = formatRecordToSave(
        uuid(),
        previousPoint[colPoints.DEAL_ID],
        previousPoint[colPoints.CAR_ID],
        trailerId,
        previousPoint[colPoints.COORDINATES],
    );

    const latestPoint = formatLatestPointToSave(
        uuid(),
        previousPoint[colPoints.DEAL_ID],
        previousPoint[colPoints.CAR_ID],
        trailerId,
        previousPoint[colPoints.COORDINATES],
    );

    const result = [
        addRecordAsTransaction(newPoint),
        ...(CarLatestPoints.addWithReplacement(
            carId, latestPoint,
        )),
    ];

    return result;
};

const addPointOnUnlinking = async (trailerId) => {
    const previousPoint = await getRecordByTrailerId(trailerId);
    const newPoint = formatRecordToSave(
        uuid(),
        previousPoint[colPoints.DEAL_ID],
        previousPoint[colPoints.CAR_ID],
        null,
        previousPoint[colPoints.COORDINATES],
    );

    const latestPoint = formatLatestPointToSave(
        uuid(),
        previousPoint[colPoints.DEAL_ID],
        previousPoint[colPoints.CAR_ID],
        null,
        previousPoint[colPoints.COORDINATES],
    );

    const result = [
        addRecordAsTransaction(newPoint),
        ...(CarLatestPoints.addWithReplacement(
            previousPoint[colPoints.CAR_ID], latestPoint,
        )),
    ];

    return result;
};

module.exports = {
    addRecordAsTransaction,
    getRecordByCarId,
    addPointOnLinking,
    addPointOnUnlinking,
};
