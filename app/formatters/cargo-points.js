// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { Geo } = require('constants/instances');
const { POINT_TYPES } = require('constants/cargo-points');

const cols = SQL_TABLES.CARGO_POINTS.COLUMNS;

const formatRecordsWithName = (cargoId, records) => {
    const uploadingPoints = records[HOMELESS_COLUMNS.UPLOADING_POINTS].map(record => formatRecordWithName(cargoId, record, POINT_TYPES.UPLOAD));
    const downloadingPoints = records[HOMELESS_COLUMNS.DOWNLOADING_POINTS].map(record => formatRecordWithName(cargoId, record, POINT_TYPES.DOWNLOAD));
    return [...uploadingPoints, ...downloadingPoints];
};

const formatRecordWithName = (cargoId, coordinates, type) => ({
    [cols.CARGO_ID]: cargoId,
    [cols.COORDINATES]: new Geo(coordinates[HOMELESS_COLUMNS.LONGITUDE], coordinates[HOMELESS_COLUMNS.LATITUDE]),
    [cols.TYPE]: type,
    [HOMELESS_COLUMNS.NAME_EN]: coordinates[HOMELESS_COLUMNS.NAME_EN],
});

const formatRecordsToSave = records => records.map(record => formatRecordToSave(record));

const formatRecordToSave = record => ({
    [cols.CARGO_ID]: record[cols.CARGO_ID],
    [cols.COORDINATES]: record[cols.COORDINATES],
    [cols.TYPE]: record[cols.TYPE],
});

module.exports = {
    formatRecordsWithName,
    formatRecordsToSave,
};
