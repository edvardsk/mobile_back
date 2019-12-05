const moment = require('moment');
const { groupBy } = require('lodash');
const geolib = require('geolib');

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
const colsEconomicSettings = SQL_TABLES.ECONOMIC_SETTINGS.COLUMNS;
const colsCargoPrices = SQL_TABLES.CARGO_PRICES.COLUMNS;
const colsCurrencyPriorities = SQL_TABLES.CURRENCY_PRIORITIES.COLUMNS;

const formatRecordToSave = (companyId, cargoId, data) => ({
    ...data,
    id: cargoId,
    [cols.COMPANY_ID]: companyId,
    [cols.LOADING_METHODS]: new SqlArray(data[cols.LOADING_METHODS]),
    [cols.GUARANTEES]: new SqlArray(data[cols.GUARANTEES]),
    [cols.FREE_COUNT]: data[cols.COUNT],
    [cols.FREEZED_AFTER]: moment().add(+FREEZE_CARGO_VALUE, FREEZE_CARGO_UNIT).toISOString(),
});

const formatRecordToEdit = data => ({
    ...data,
    [cols.FREE_COUNT]: data[cols.COUNT],
    [cols.LOADING_METHODS]: new SqlArray(data[cols.LOADING_METHODS]),
    [cols.GUARANTEES]: new SqlArray(data[cols.GUARANTEES]),
});

const formatRecordForList = (cargo, userLanguageId) => {
    const result = {
        id: cargo.id,
        [cols.COUNT]: cargo[cols.COUNT],
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
        [HOMELESS_COLUMNS.DANGER_CLASS_NAME]: cargo[HOMELESS_COLUMNS.DANGER_CLASS_NAME],
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
        [cols.COUNT]: cargo[cols.COUNT],
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
        cols.COUNT,
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
            const singleValue = translates.pop();
            return {
                ...singleValue,
                [HOMELESS_COLUMNS.NAME_EN]: singleValue[HOMELESS_COLUMNS.CITY_NAME],
            };
        } else {
            const [language1, language2] = translates;
            return language1['languageId'] === languageId ? { ...language1, [HOMELESS_COLUMNS.NAME_EN]: language2[HOMELESS_COLUMNS.CITY_NAME] } : { ...language2, [HOMELESS_COLUMNS.NAME_EN]: language1[HOMELESS_COLUMNS.CITY_NAME] };
        }
    });
};

const formatRecordForSearchResponse = (
    cargos, uploadingPoint, downloadingPoint, searchLanguageId, defaultEconomicSettings, currencyPriorities
) => {
    const cargosInsideFigure = cargos
        .map(cargo => {
            const formattedCargo = formatRecordForList(cargo);
            return {
                ...formattedCargo,
                [HOMELESS_COLUMNS.PRICES]: formatPricesWithFee(
                    formattedCargo[HOMELESS_COLUMNS.PRICES], defaultEconomicSettings, cargo[HOMELESS_COLUMNS.ECONOMIC_SETTINGS], currencyPriorities
                ),
                [HOMELESS_COLUMNS.ALL_UPLOADING_POINTS]: cargo[HOMELESS_COLUMNS.ALL_UPLOADING_POINTS],
                [HOMELESS_COLUMNS.ALL_DOWNLOADING_POINTS]: cargo[HOMELESS_COLUMNS.ALL_DOWNLOADING_POINTS],
            };
        })
        .filter(cargo => {
            return downloadingPoint
                ? cargo[HOMELESS_COLUMNS.UPLOADING_POINTS].length === cargo[HOMELESS_COLUMNS.ALL_UPLOADING_POINTS].length &&
                cargo[HOMELESS_COLUMNS.DOWNLOADING_POINTS].length === cargo[HOMELESS_COLUMNS.ALL_DOWNLOADING_POINTS].length
                : cargo[HOMELESS_COLUMNS.UPLOADING_POINTS].length === cargo[HOMELESS_COLUMNS.ALL_UPLOADING_POINTS].length;
        });
    return downloadingPoint
        ? cargosInsideFigure
            .filter(cargo => {
                const upPoints = cargo[HOMELESS_COLUMNS.UPLOADING_POINTS];
                const downPoints = cargo[HOMELESS_COLUMNS.DOWNLOADING_POINTS];
                const upPointCenter = geolib.getCenter(upPoints);
                const downPointCenter = geolib.getCenter(downPoints);
                return calculateAngleBetweenVectors(upPointCenter, downPointCenter, uploadingPoint, downloadingPoint) <= 90;
            })
        : cargosInsideFigure;
};

const formatRecordForSearchAllResponse = (cargos, defaultEconomicSettings, currencyPriorities) => {
    return cargos
        .map(cargo => {
            const formattedCargo = formatRecordForList(cargo);
            return {
                ...formattedCargo,
                [HOMELESS_COLUMNS.PRICES]: formatPricesWithFee(
                    formattedCargo[HOMELESS_COLUMNS.PRICES],
                    defaultEconomicSettings,
                    cargo[HOMELESS_COLUMNS.ECONOMIC_SETTINGS],
                    currencyPriorities
                ),
            };
        });
};

const calculateAngleBetweenVectors = (upPoint, downPoint, initUpPoint, initDownPoint) => {
    const a1 = parseFloat(upPoint[HOMELESS_COLUMNS.LONGITUDE]);
    const a2 = parseFloat(upPoint[HOMELESS_COLUMNS.LATITUDE]);

    const b1 = parseFloat(downPoint[HOMELESS_COLUMNS.LONGITUDE]);
    const b2 = parseFloat(downPoint[HOMELESS_COLUMNS.LATITUDE]);

    const c1 = parseFloat(initUpPoint[HOMELESS_COLUMNS.LONGITUDE]);
    const c2 = parseFloat(initUpPoint[HOMELESS_COLUMNS.LATITUDE]);

    const d1 = parseFloat(initDownPoint[HOMELESS_COLUMNS.LONGITUDE]);
    const d2 = parseFloat(initDownPoint[HOMELESS_COLUMNS.LATITUDE]);

    const ab1 = b1 - a1;
    const ab2 = b2 - a2;

    const cd1 = d1 - c1;
    const cd2 = d2 - c2;

    const cos = (ab1 * cd1 + ab2 * cd2) / ((Math.sqrt(ab1 ** 2 + ab2 ** 2)) * (Math.sqrt(cd1 ** 2 + cd2 ** 2)));
    return Math.acos(cos) * (180 / Math.PI);
};

const formatPricesWithFee = (prices, defaultSettings, companySettings, currencyPriorities) => {
    let transporterPercent = parseFloat(defaultSettings[colsEconomicSettings.PERCENT_FROM_TRANSPORTER]);
    let holderPercent = parseFloat(defaultSettings[colsEconomicSettings.PERCENT_FROM_HOLDER]);
    if (companySettings && companySettings[colsEconomicSettings.PERCENT_FROM_TRANSPORTER] && companySettings[colsEconomicSettings.PERCENT_FROM_HOLDER]) {
        transporterPercent = parseFloat(companySettings[colsEconomicSettings.PERCENT_FROM_TRANSPORTER]);
        holderPercent = parseFloat(companySettings[colsEconomicSettings.PERCENT_FROM_HOLDER]);
    }

    const formattedPrices = prices.map(price => {
        const priceValue = price[colsCargoPrices.PRICE];
        const amountFromTransporter = parseFloat((priceValue * (transporterPercent / 100)).toFixed(2));
        const amountFromHolder = parseFloat((priceValue * (holderPercent / 100)).toFixed(2));
        const finalPrice = parseFloat((priceValue - amountFromTransporter - amountFromHolder).toFixed(2));
        return {
            ...price,
            [colsCargoPrices.PRICE]: finalPrice,
        };
    });
    return currencyPriorities.reduce((acc, currency) => {
        const currencyId = currency[colsCurrencyPriorities.CURRENCY_ID];
        const price = formattedPrices.find(price => price[colsCargoPrices.CURRENCY_ID] === currencyId);
        if (price) {
            acc.unshift(price);
        }
        return acc;
    }, []);
};

module.exports = {
    formatRecordToSave,
    formatRecordToEdit,
    formatRecordForList,
    formatRecordForResponse,
    formatCargoData,
    formatRecordForSearchResponse,
    formatRecordForSearchAllResponse,
};
