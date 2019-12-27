// constants
const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.CAR_POINTS.COLUMNS;

const formatRecordToSave = (id, dealId, carId, trailerId, coordinates) => ({
    id: id,
    [cols.DEAL_ID]: dealId,
    [cols.CAR_ID]: carId,
    [cols.TRAILER_ID]: trailerId,
    [cols.COORDINATES]: coordinates,
});

const formatPoinstForList = (point) => ({
    id: point.id,
    [cols.COORDINATES]: point[cols.COORDINATES],
    [cols.CREATED_AT]: point[cols.CREATED_AT],
});

module.exports = {
    formatRecordToSave,
    formatPoinstForList,
};
