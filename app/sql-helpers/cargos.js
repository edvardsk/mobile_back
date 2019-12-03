const squel = require('squel');
const { get } = require('lodash');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { SqlArray, Geo, GeoLine } = require('constants/instances');
const { CARGO_STATUSES_MAP } = require('constants/cargo-statuses');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.CARGOS;
const tableCargoStatuses = SQL_TABLES.CARGO_STATUSES;
const tableDangerClasses = SQL_TABLES.DANGER_CLASSES;
const tableVehicleClasses = SQL_TABLES.VEHICLE_TYPES;
const tableCargoPoints = SQL_TABLES.CARGO_POINTS;
const tableCargoPrices = SQL_TABLES.CARGO_PRICES;
const tablePoints = SQL_TABLES.POINTS;
const tableTranslations = SQL_TABLES.POINT_TRANSLATIONS;
const tableCurrencies = SQL_TABLES.CURRENCIES;

const cols = table.COLUMNS;
const colsCargoStatuses = tableCargoStatuses.COLUMNS;
const colsDangerClasses = tableDangerClasses.COLUMNS;
const colsVehicleClasses = tableVehicleClasses.COLUMNS;
const colsCargoPoints = tableCargoPoints.COLUMNS;
const colsCargoPrices = tableCargoPrices.COLUMNS;
const colsPoints = tablePoints.COLUMNS;
const colsTranslations = tableTranslations.COLUMNS;
const colsCurrencies = tableCurrencies.COLUMNS;

squelPostgres.registerValueHandler(SqlArray, function(value) {
    return value.toString();
});

squelPostgres.registerValueHandler(GeoLine, function(value) {
    return value.toString();
});

squelPostgres.registerValueHandler(Geo, function(value) {
    return value.toString();
});

const insertRecord = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFields(values)
    .returning('*')
    .toString();

const updateRecordById = (id, data) => squelPostgres
    .update()
    .table(table.NAME)
    .setFields(data)
    .where(`id = '${id}'`)
    .returning('*')
    .toString();

const deleteRecordById = id => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`id = '${id}'`)
    .returning('*')
    .toString();

const selectRecordById = id => squelPostgres
    .select()
    .field('c.*')
    .field(`cs.${colsCargoStatuses.NAME}`, HOMELESS_COLUMNS.STATUS)
    .from(table.NAME, 'c')
    .where(`c.id = '${id}'`)
    .where(`c.${cols.DELETED} = 'f'`)
    .left_join(tableCargoStatuses.NAME, 'cs', `cs.id = c.${cols.STATUS_ID}`)
    .toString();

const selectRecordByWithCoordinatesId = (id, userLanguageId) => squelPostgres
    .select()
    .field('c.*')
    .field(`cs.${colsCargoStatuses.NAME}`, HOMELESS_COLUMNS.STATUS)
    .field(`ARRAY(${
        squelPostgres
            .select()
            .field(`row_to_json(row(
            cpr.${colsCargoPrices.CURRENCY_ID}, cpr.${colsCargoPrices.NEXT_CURRENCY_ID}, cpr.${colsCargoPrices.PRICE}, cur.${colsCurrencies.CODE}
            ))`)
            .from(tableCargoPrices.NAME, 'cpr')
            .where(`cpr.${colsCargoPrices.CARGO_ID} = c.id`)
            .left_join(tableCurrencies.NAME, 'cur', `cur.id= cpr.${colsCargoPrices.CURRENCY_ID}`)
            .toString()
    })`, HOMELESS_COLUMNS.PRICES)
    .field(`ARRAY(${
        squelPostgres
            .select()
            .field(`row_to_json(row(ST_AsText(cp.${colsCargoPoints.COORDINATES}), t.${colsTranslations.VALUE}, t.${colsTranslations.LANGUAGE_ID}))`)
            .from(tableCargoPoints.NAME, 'cp')
            .where(`cp.${colsCargoPoints.CARGO_ID} = c.id`)
            .where(`cp.${colsCargoPoints.TYPE} = 'upload'`)
            .where(`t.${colsTranslations.LANGUAGE_ID} = '${userLanguageId}' OR t.${colsTranslations.LANGUAGE_ID} = (SELECT id FROM languages WHERE code = 'en')`)
            .left_join(tablePoints.NAME, 'p', `p.${colsPoints.COORDINATES} = cp.${colsCargoPoints.COORDINATES}`)
            .left_join(tableTranslations.NAME, 't', `t.${colsTranslations.POINT_ID} = p.id`)
            .toString()
    })`, HOMELESS_COLUMNS.UPLOADING_POINTS)
    .field(`ARRAY(${
        squelPostgres
            .select()
            .field(`row_to_json(row(ST_AsText(cp.${colsCargoPoints.COORDINATES}), t.${colsTranslations.VALUE}, t.${colsTranslations.LANGUAGE_ID}))`)
            .from(tableCargoPoints.NAME, 'cp')
            .where(`cp.${colsCargoPoints.CARGO_ID} = c.id`)
            .where(`cp.${colsCargoPoints.TYPE} = 'download'`)
            .where(`t.${colsTranslations.LANGUAGE_ID} = '${userLanguageId}' OR t.${colsTranslations.LANGUAGE_ID} = (SELECT id FROM languages WHERE code = 'en')`)
            .left_join(tablePoints.NAME, 'p', `p.${colsPoints.COORDINATES} = cp.${colsCargoPoints.COORDINATES}`)
            .left_join(tableTranslations.NAME, 't', `t.${colsTranslations.POINT_ID} = p.id`)
            .toString()
    })`, HOMELESS_COLUMNS.DOWNLOADING_POINTS)
    .field(`dc.${colsDangerClasses.NAME}`, HOMELESS_COLUMNS.DANGER_CLASS_NAME)
    .field(`vc.${colsVehicleClasses.NAME}`, HOMELESS_COLUMNS.VEHICLE_TYPE_NAME)
    .from(table.NAME, 'c')
    .where(`c.id = '${id}'`)
    .where(`c.${cols.DELETED} = 'f'`)
    .left_join(tableCargoStatuses.NAME, 'cs', `cs.id = c.${cols.STATUS_ID}`)
    .left_join(tableDangerClasses.NAME, 'dc', `dc.id = c.${cols.DANGER_CLASS_ID}`)
    .left_join(tableVehicleClasses.NAME, 'vc', `vc.id = c.${cols.VEHICLE_TYPE_ID}`)
    .toString();

const selectRecordByIdLight = id => squelPostgres
    .select()
    .from(table.NAME)
    .where(`id = '${id}'`)
    .where(`${cols.DELETED} = 'f'`)
    .toString();

const selectRecordsByCompanyId = companyId => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.COMPANY_ID} = '${companyId}'`)
    .where(`${cols.DELETED} = 'f'`)
    .toString();

const selectCargosByCompanyIdPaginationSorting = (companyId, limit, offset, sortColumn, asc, filter, userLanguageId) => {
    let expression = squelPostgres
        .select()
        .field('c.*')
        .field(`cs.${colsCargoStatuses.NAME}`, HOMELESS_COLUMNS.STATUS)
        .field(`ARRAY(${
            squelPostgres
                .select()
                .field(`row_to_json(row(
            cpr.${colsCargoPrices.CURRENCY_ID}, cpr.${colsCargoPrices.NEXT_CURRENCY_ID}, cpr.${colsCargoPrices.PRICE}, cur.${colsCurrencies.CODE}
            ))`)
                .from(tableCargoPrices.NAME, 'cpr')
                .where(`cpr.${colsCargoPrices.CARGO_ID} = c.id`)
                .left_join(tableCurrencies.NAME, 'cur', `cur.id= cpr.${colsCargoPrices.CURRENCY_ID}`)
                .toString()
        })`, HOMELESS_COLUMNS.PRICES)
        .field(`ARRAY(${
            squelPostgres
                .select()
                .field(`row_to_json(row(ST_AsText(cp.${colsCargoPoints.COORDINATES}), t.${colsTranslations.VALUE}, t.${colsTranslations.LANGUAGE_ID}))`)
                .from(tableCargoPoints.NAME, 'cp')
                .where(`cp.${colsCargoPoints.CARGO_ID} = c.id`)
                .where(`cp.${colsCargoPoints.TYPE} = 'upload'`)
                .where(`t.${colsTranslations.LANGUAGE_ID} = '${userLanguageId}' OR t.${colsTranslations.LANGUAGE_ID} = (SELECT id FROM languages WHERE code = 'en')`)
                .left_join(tablePoints.NAME, 'p', `p.${colsPoints.COORDINATES} = cp.${colsCargoPoints.COORDINATES}`)
                .left_join(tableTranslations.NAME, 't', `t.${colsTranslations.POINT_ID} = p.id`)
                .toString()
        })`, HOMELESS_COLUMNS.UPLOADING_POINTS)
        .field(`ARRAY(${
            squelPostgres
                .select()
                .field(`row_to_json(row(ST_AsText(cp.${colsCargoPoints.COORDINATES}), t.${colsTranslations.VALUE}, t.${colsTranslations.LANGUAGE_ID}))`)
                .from(tableCargoPoints.NAME, 'cp')
                .where(`cp.${colsCargoPoints.CARGO_ID} = c.id`)
                .where(`cp.${colsCargoPoints.TYPE} = 'download'`)
                .where(`t.${colsTranslations.LANGUAGE_ID} = '${userLanguageId}' OR t.${colsTranslations.LANGUAGE_ID} = (SELECT id FROM languages WHERE code = 'en')`)
                .left_join(tablePoints.NAME, 'p', `p.${colsPoints.COORDINATES} = cp.${colsCargoPoints.COORDINATES}`)
                .left_join(tableTranslations.NAME, 't', `t.${colsTranslations.POINT_ID} = p.id`)
                .toString()
        })`, HOMELESS_COLUMNS.DOWNLOADING_POINTS)
        .field(`vc.${colsVehicleClasses.NAME}`, HOMELESS_COLUMNS.VEHICLE_TYPE_NAME)
        .from(table.NAME, 'c')
        .where(`c.${cols.COMPANY_ID} = '${companyId}'`)
        .where(`c.${cols.DELETED} = 'f'`);

    expression = setCargosFilter(expression, filter);
    return expression
        .left_join(tableCargoStatuses.NAME, 'cs', `cs.id = c.${cols.STATUS_ID}`)
        .left_join(tableVehicleClasses.NAME, 'vc', `vc.id = c.${cols.VEHICLE_TYPE_ID}`)
        .order(sortColumn, asc)
        .limit(limit)
        .offset(offset)
        .toString();
};

const selectCountCargosByCompanyId = (companyId, filter) => {
    let expression = squelPostgres
        .select()
        .field('COUNT(c.id)')
        .from(table.NAME, 'c')
        .where(`c.${cols.COMPANY_ID} = '${companyId}'`)
        .where(`c.${cols.DELETED} = 'f'`);

    expression = setCargosFilter(expression, filter);
    return expression
        .left_join(tableCargoStatuses.NAME, 'cs', `cs.id = c.${cols.STATUS_ID}`)
        .toString();
};

const setCargosFilter = (expression, filteringObject) => {
    const filteringObjectSQLExpressions = [
        [HOMELESS_COLUMNS.STATUS, `cs.${colsCargoStatuses.NAME} IN ?`, filteringObject[HOMELESS_COLUMNS.STATUS]],
    ];

    for (let [key, exp, values] of filteringObjectSQLExpressions) {
        if (Array.isArray(get(filteringObject, key))) {
            expression = expression.where(exp, values);
        } else if (get(filteringObject, key) !== undefined) {
            expression = expression.where(exp);
        }
    }
    return expression;
};

const selectRecordsForSearch = ({ upGeo, downGeo, geoLine }, { uploadingDate, downloadingDate }, languageId, filter = {}) => {
    let expression = squelPostgres
        .select()
        .from(table.NAME, 'c')
        .field('c.*')
        .field(`cs.${colsCargoStatuses.NAME}`, HOMELESS_COLUMNS.STATUS)
        .field(`ARRAY(${
            squelPostgres
                .select()
                .field(`row_to_json(row(
            cpr.${colsCargoPrices.CURRENCY_ID}, cpr.${colsCargoPrices.NEXT_CURRENCY_ID}, cpr.${colsCargoPrices.PRICE}, cur.${colsCurrencies.CODE}
            ))`)
                .from(tableCargoPrices.NAME, 'cpr')
                .where(`cpr.${colsCargoPrices.CARGO_ID} = c.id`)
                .left_join(tableCurrencies.NAME, 'cur', `cur.id= cpr.${colsCargoPrices.CURRENCY_ID}`)
                .toString()
        })`, HOMELESS_COLUMNS.PRICES)
        .field(`ARRAY(${
            squelPostgres
                .select()
                .field(`row_to_json(row(ST_AsText(cp.${colsCargoPoints.COORDINATES}), t.${colsTranslations.VALUE}, t.${colsTranslations.LANGUAGE_ID}))`)
                .from(tableCargoPoints.NAME, 'cp')
                .where(`cp.${colsCargoPoints.CARGO_ID} = c.id`)
                .where(`cp.${colsCargoPoints.TYPE} = 'upload'`)
                .where(`t.${colsTranslations.LANGUAGE_ID} = '${languageId}' OR t.${colsTranslations.LANGUAGE_ID} = (SELECT id FROM languages WHERE code = 'en')`)
                .where(
                    squel
                        .expr()
                        .and(`ST_DWithin(ST_Buffer(${upGeo}, 300000, 50), cp.${colsCargoPoints.COORDINATES}, 0)`)
                        .or(`ST_DWithin(ST_Buffer(${downGeo}, 300000, 50), cp.${colsCargoPoints.COORDINATES}, 0)`)
                        .or(`ST_DWithin(ST_Buffer(${geoLine}, 50000, 'endcap=square'), cp.${colsCargoPoints.COORDINATES}, 0)`)
                )
                .left_join(tablePoints.NAME, 'p', `p.${colsPoints.COORDINATES} = cp.${colsCargoPoints.COORDINATES}`)
                .left_join(tableTranslations.NAME, 't', `t.${colsTranslations.POINT_ID} = p.id`)
                .toString()
        })`, HOMELESS_COLUMNS.UPLOADING_POINTS)
        .field(`ARRAY(${
            squelPostgres
                .select()
                .field('cp.id')
                .from(tableCargoPoints.NAME, 'cp')
                .where(`cp.${colsCargoPoints.CARGO_ID} = c.id`)
                .where(`cp.${colsCargoPoints.TYPE} = 'upload'`)
                .left_join(tablePoints.NAME, 'p', `p.${colsPoints.COORDINATES} = cp.${colsCargoPoints.COORDINATES}`)
                .toString()
        })`, HOMELESS_COLUMNS.ALL_UPLOADING_POINTS)
        .field(`ARRAY(${
            squelPostgres
                .select()
                .field(`row_to_json(row(ST_AsText(cp.${colsCargoPoints.COORDINATES}), t.${colsTranslations.VALUE}, t.${colsTranslations.LANGUAGE_ID}))`)
                .from(tableCargoPoints.NAME, 'cp')
                .where(`cp.${colsCargoPoints.CARGO_ID} = c.id`)
                .where(`cp.${colsCargoPoints.TYPE} = 'download'`)
                .where(`t.${colsTranslations.LANGUAGE_ID} = '${languageId}' OR t.${colsTranslations.LANGUAGE_ID} = (SELECT id FROM languages WHERE code = 'en')`)
                .where(
                    squel
                        .expr()
                        .and(`ST_DWithin(ST_Buffer(${upGeo}, 300000, 50), cp.${colsCargoPoints.COORDINATES}, 0)`)
                        .or(`ST_DWithin(ST_Buffer(${downGeo}, 300000, 50), cp.${colsCargoPoints.COORDINATES}, 0)`)
                        .or(`ST_DWithin(ST_Buffer(${geoLine}, 50000, 'endcap=square'), cp.${colsCargoPoints.COORDINATES}, 0)`)
                )
                .left_join(tablePoints.NAME, 'p', `p.${colsPoints.COORDINATES} = cp.${colsCargoPoints.COORDINATES}`)
                .left_join(tableTranslations.NAME, 't', `t.${colsTranslations.POINT_ID} = p.id`)
                .toString()
        })`, HOMELESS_COLUMNS.DOWNLOADING_POINTS)
        .field(`ARRAY(${
            squelPostgres
                .select()
                .field('cp.id')
                .from(tableCargoPoints.NAME, 'cp')
                .where(`cp.${colsCargoPoints.CARGO_ID} = c.id`)
                .where(`cp.${colsCargoPoints.TYPE} = 'download'`)
                .left_join(tablePoints.NAME, 'p', `p.${colsPoints.COORDINATES} = cp.${colsCargoPoints.COORDINATES}`)
                .toString()
        })`, HOMELESS_COLUMNS.ALL_DOWNLOADING_POINTS)
        .where(`cs.${colsCargoStatuses.NAME} = '${CARGO_STATUSES_MAP.NEW}'`)
        .where(`c.${cols.UPLOADING_DATE_FROM} <= '${uploadingDate}'`)
        .where(`c.${cols.UPLOADING_DATE_TO} >= '${uploadingDate}'`)
        .where(`c.${cols.DOWNLOADING_DATE_FROM} <= '${downloadingDate}'`)
        .where(`c.${cols.DOWNLOADING_DATE_TO} >= '${downloadingDate}'`)
        .where(`c.${cols.DELETED} = 'f'`);

    expression = setCargosSearchFilter(expression, filter);
    return expression
        .left_join(tableCargoStatuses.NAME, 'cs', `cs.id = c.${cols.STATUS_ID}`)
        .left_join(tableCargoPoints.NAME, 'cp', `cp.${colsCargoPoints.CARGO_ID} = c.${cols.STATUS_ID}`)
        .toString();
};

const setCargosSearchFilter = (expression, filteringObject) => {
    const filteringObjectSQLExpressions = [
    ];

    for (let [key, exp, values] of filteringObjectSQLExpressions) {
        if (Array.isArray(get(filteringObject, key))) {
            expression = expression.where(exp, values);
        } else if (get(filteringObject, key) !== undefined) {
            expression = expression.where(exp);
        }
    }
    return expression;
};

module.exports = {
    insertRecord,
    updateRecordById,
    deleteRecordById,
    selectRecordById,
    selectRecordByWithCoordinatesId,
    selectRecordByIdLight,
    selectRecordsByCompanyId,
    selectCargosByCompanyIdPaginationSorting,
    selectCountCargosByCompanyId,
    selectRecordsForSearch,
};
