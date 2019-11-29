const moment = require('moment');
const { groupBy } = require('lodash');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { SqlArray } = require('constants/instances');

// formatters
const { formatGeoPointWithName, formatGeoPointWithNameFromPostgresJSONToObject } = require('./geo');
const { formatPricesFromPostgresJSON } = require('./cargo-prices');

const {
    FREEZE_CARGO_UNIT,
    FREEZE_CARGO_VALUE,
} = process.env;

const cols = SQL_TABLES.CARGOS.COLUMNS;

const formatRecordToSave = (companyId, cargoId, statusId, data) => ({
    ...data,
    id: cargoId,
    [cols.COMPANY_ID]: companyId,
    [cols.LOADING_METHODS]: new SqlArray(data[cols.LOADING_METHODS]),
    [cols.GUARANTEES]: new SqlArray(data[cols.GUARANTEES]),
    [cols.STATUS_ID]: statusId,
    [cols.FREEZED_AFTER]: moment().add(+FREEZE_CARGO_VALUE, FREEZE_CARGO_UNIT).toISOString(),
});

const formatRecordToEdit = data => ({
    ...data,
    [cols.LOADING_METHODS]: new SqlArray(data[cols.LOADING_METHODS]),
    [cols.GUARANTEES]: new SqlArray(data[cols.GUARANTEES]),
});

const formatRecordForList = (cargo, userLanguageId) => {
    const result = {
        id: cargo.id,
        [cols.UPLOADING_DATE_FROM]: cargo[cols.UPLOADING_DATE_FROM],
        [cols.UPLOADING_DATE_TO]: cargo[cols.UPLOADING_DATE_TO],
        [cols.DOWNLOADING_DATE_FROM]: cargo[cols.DOWNLOADING_DATE_FROM],
        [cols.DOWNLOADING_DATE_TO]: cargo[cols.DOWNLOADING_DATE_TO],
        [cols.CREATED_AT]: cargo[cols.CREATED_AT],
        [cols.WIDTH]: parseFloat(cargo[cols.WIDTH]),
        [cols.GROSS_WEIGHT]: parseFloat(cargo[cols.GROSS_WEIGHT]),
        [cols.LENGTH]: parseFloat(cargo[cols.LENGTH]),
        [cols.HEIGHT]: parseFloat(cargo[cols.HEIGHT]),
        [cols.DESCRIPTION]: cargo[cols.DESCRIPTION],
        [HOMELESS_COLUMNS.STATUS]: cargo[HOMELESS_COLUMNS.STATUS],
        [HOMELESS_COLUMNS.VEHICLE_TYPE_NAME]: cargo[HOMELESS_COLUMNS.VEHICLE_TYPE_NAME],
    };

    const [uploadingPoints, downloadingPoints] = formatGeoPoints(cargo, userLanguageId);
    const prices = formatPricesFromPostgresJSON(cargo[HOMELESS_COLUMNS.PRICES]);

    return {
        ...result,
        [HOMELESS_COLUMNS.UPLOADING_POINTS]: uploadingPoints,
        [HOMELESS_COLUMNS.DOWNLOADING_POINTS]: downloadingPoints,
        [HOMELESS_COLUMNS.PRICES]: prices,
    };
};

const formatRecordForResponse = (cargo, userLanguageId) => {
    const result = {
        id: cargo.id,
        [cols.UPLOADING_DATE_FROM]: cargo[cols.UPLOADING_DATE_FROM],
        [cols.UPLOADING_DATE_TO]: cargo[cols.UPLOADING_DATE_TO],
        [cols.DOWNLOADING_DATE_FROM]: cargo[cols.DOWNLOADING_DATE_FROM],
        [cols.DOWNLOADING_DATE_TO]: cargo[cols.DOWNLOADING_DATE_TO],
        [cols.GROSS_WEIGHT]: parseFloat(cargo[cols.GROSS_WEIGHT]),
        [cols.WIDTH]: parseFloat(cargo[cols.WIDTH]),
        [cols.HEIGHT]: parseFloat(cargo[cols.HEIGHT]),
        [cols.LENGTH]: parseFloat(cargo[cols.LENGTH]),
        [cols.LOADING_METHODS]: cargo[cols.LOADING_METHODS],
        [cols.LOADING_TYPE]: cargo[cols.LOADING_TYPE],
        [cols.GUARANTEES]: cargo[cols.GUARANTEES],
        [cols.DANGER_CLASS_ID]: cargo[cols.DANGER_CLASS_ID],
        [cols.VEHICLE_TYPE_ID]: cargo[cols.VEHICLE_TYPE_ID],
        [HOMELESS_COLUMNS.DANGER_CLASS_NAME]: cargo[HOMELESS_COLUMNS.DANGER_CLASS_NAME],
        [HOMELESS_COLUMNS.VEHICLE_TYPE_NAME]: cargo[HOMELESS_COLUMNS.VEHICLE_TYPE_NAME],
        [cols.PACKING_DESCRIPTION]: cargo[cols.PACKING_DESCRIPTION],
        [cols.DESCRIPTION]: cargo[cols.DESCRIPTION],
        [cols.CREATED_AT]: cargo[cols.CREATED_AT],
        [HOMELESS_COLUMNS.STATUS]: cargo[HOMELESS_COLUMNS.STATUS],
    };
    const [uploadingPoints, downloadingPoints] = formatGeoPoints(cargo, userLanguageId);
    const prices = formatPricesFromPostgresJSON(cargo[HOMELESS_COLUMNS.PRICES]);

    return {
        ...result,
        [HOMELESS_COLUMNS.UPLOADING_POINTS]: uploadingPoints,
        [HOMELESS_COLUMNS.DOWNLOADING_POINTS]: downloadingPoints,
        [HOMELESS_COLUMNS.PRICES]: prices,
    };
};

const formatCargoData = body => {
    const CARGOS_PROPS = new Set([
        cols.UPLOADING_DATE_FROM,
        cols.UPLOADING_DATE_TO,
        cols.DOWNLOADING_DATE_FROM,
        cols.DOWNLOADING_DATE_TO,
        cols.GROSS_WEIGHT,
        cols.WIDTH,
        cols.HEIGHT,
        cols.LENGTH,
        cols.LOADING_METHODS,
        cols.LOADING_TYPE,
        cols.GUARANTEES,
        cols.DANGER_CLASS_ID,
        cols.VEHICLE_TYPE_ID,
        cols.PACKING_DESCRIPTION,
        cols.DESCRIPTION,
    ]);

    const CARGO_POINTS_PROPS = new Set([
        HOMELESS_COLUMNS.UPLOADING_POINTS,
        HOMELESS_COLUMNS.DOWNLOADING_POINTS,
    ]);

    const cargosProps = {};
    const cargoPointsProps = {};
    Object.keys(body).forEach(key => {
        if (CARGOS_PROPS.has(key)) {
            cargosProps[key] = body[key];
        } else if (CARGO_POINTS_PROPS.has(key)) {
            cargoPointsProps[key] = body[key];
        }
    });
    return { cargosProps, cargoPointsProps };
};

const formatGeoPoints = (cargo, userLanguageId) => {
    const up = cargo[HOMELESS_COLUMNS.UPLOADING_POINTS].map(value => formatGeoPointWithNameFromPostgresJSONToObject(value));
    const down = cargo[HOMELESS_COLUMNS.DOWNLOADING_POINTS].map(value => formatGeoPointWithNameFromPostgresJSONToObject(value));

    const uniqueUp = uniqueByLanguageId(up, userLanguageId);
    const uniqueDown = uniqueByLanguageId(down, userLanguageId);

    const uploadingPoints = uniqueUp.map(point => formatGeoPointWithName(point));
    const downloadingPoints = uniqueDown.map(point => formatGeoPointWithName(point));
    return [uploadingPoints, downloadingPoints];
};

const uniqueByLanguageId = (list, languageId) => {
    const grouped = groupBy(list, HOMELESS_COLUMNS.COORDINATES);
    return Object.keys(grouped).map(coordinate => {
        const translates = grouped[coordinate];
        if (translates.length === 1) {
            return translates.pop();
        } else {
            const [language1, language2] = translates;
            return language1['languageId'] === languageId ? language1 : language2;
        }
    });
};

module.exports = {
    formatRecordToSave,
    formatRecordToEdit,
    formatRecordForList,
    formatRecordForResponse,
    formatCargoData,
};
