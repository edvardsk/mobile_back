// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { SqlArray } = require('constants/instances');

// formatters
const { formatGeoPointToObject } = require('./geo');

const cols = SQL_TABLES.CARGOS.COLUMNS;

const formatRecordToSave = (companyId, cargoId, statusId, data) => ({
    ...data,
    id: cargoId,
    [cols.COMPANY_ID]: companyId,
    [cols.LOADING_METHODS]: new SqlArray(data[cols.LOADING_METHODS]),
    [cols.GUARANTEES]: new SqlArray(data[cols.GUARANTEES]),
    [cols.STATUS_ID]: statusId,
});

const formatRecordForList = cargo => ({
    id: cargo.id,
    [cols.UPLOADING_DATE_FROM]: cargo[cols.UPLOADING_DATE_FROM],
    [cols.UPLOADING_DATE_TO]: cargo[cols.UPLOADING_DATE_TO],
    [cols.DOWNLOADING_DATE_FROM]: cargo[cols.DOWNLOADING_DATE_FROM],
    [cols.DOWNLOADING_DATE_TO]: cargo[cols.DOWNLOADING_DATE_TO],
    [cols.CREATED_AT]: cargo[cols.CREATED_AT],
    [HOMELESS_COLUMNS.STATUS]: cargo[HOMELESS_COLUMNS.STATUS],
    [HOMELESS_COLUMNS.UPLOADING_POINTS]: cargo[HOMELESS_COLUMNS.UPLOADING_POINTS].map(value => formatGeoPointToObject(value)),
    [HOMELESS_COLUMNS.DOWNLOADING_POINTS]: cargo[HOMELESS_COLUMNS.DOWNLOADING_POINTS].map(value => formatGeoPointToObject(value)),
});

module.exports = {
    formatRecordToSave,
    formatRecordForList,
};
