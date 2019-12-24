// constants
const { SQL_TABLES } = require('constants/tables');
const pickBy = require('lodash/pickBy');

const cols = SQL_TABLES.CAR_LATEST_POINTS.COLUMNS;

const formatRecordToSave = (id, dealId, carId, trailerId, coordinates, availabilityTime) => (pickBy({
    id: id,
    [cols.DEAL_ID]: dealId,
    [cols.CAR_ID]: carId,
    [cols.TRAILER_ID]: trailerId,
    [cols.COORDINATES]: coordinates,
    [availabilityTime && cols.AVAILABILITY_TIME]: availabilityTime,
}));

module.exports = {
    formatRecordToSave,
};
