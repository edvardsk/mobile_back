// constants
const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.DEAL_POINTS_INFO.COLUMNS;

const formatRecordsToSave = (dealId, pointsObj) => Object.keys(pointsObj).map(key => ({
    [cols.DEAL_ID]: dealId,
    [cols.CARGO_POINT_ID]: key,
    [cols.POINT_ADDRESS]: pointsObj[key][cols.POINT_ADDRESS],
    [cols.POINT_PERSON_FULL_NAME]: pointsObj[key][cols.POINT_PERSON_FULL_NAME],
    [cols.POINT_PERSON_FULL_PHONE_NUMBER]: pointsObj[key][cols.POINT_PERSON_FULL_PHONE_NUMBER],
}));

module.exports = {
    formatRecordsToSave,
};
