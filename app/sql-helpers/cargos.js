const squel = require('squel');
const { get } = require('lodash');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { SqlArray, Geo, GeoLine } = require('constants/instances');

const CARGO_SEARCH_LINE_RADIUS_KM = +process.env.CARGO_SEARCH_LINE_RADIUS_KM || 50;

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.CARGOS;
const tableDangerClasses = SQL_TABLES.DANGER_CLASSES;
const tableVehicleClasses = SQL_TABLES.VEHICLE_TYPES;
const tableCargoPoints = SQL_TABLES.CARGO_POINTS;
const tableCargoPrices = SQL_TABLES.CARGO_PRICES;
const tablePoints = SQL_TABLES.POINTS;
const tableTranslations = SQL_TABLES.POINT_TRANSLATIONS;
const tableCurrencies = SQL_TABLES.CURRENCIES;
const tableEconomicSettings = SQL_TABLES.ECONOMIC_SETTINGS;

const cols = table.COLUMNS;
const colsDangerClasses = tableDangerClasses.COLUMNS;
const colsVehicleClasses = tableVehicleClasses.COLUMNS;
const colsCargoPoints = tableCargoPoints.COLUMNS;
const colsCargoPrices = tableCargoPrices.COLUMNS;
const colsPoints = tablePoints.COLUMNS;
const colsTranslations = tableTranslations.COLUMNS;
const colsCurrencies = tableCurrencies.COLUMNS;
const colsEconomicSettings =  tableEconomicSettings.COLUMNS;

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
    .from(table.NAME, 'c')
    .where(`c.id = '${id}'`)
    .where(`c.${cols.DELETED} = 'f'`)
    .where(`c.${cols.FREEZED_AFTER} > now()`)
    .toString();

const selectRecordByWithCoordinatesId = (id, userLanguageId) => squelPostgres
    .select()
    .field('c.*')
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
    .where(`c.${cols.FREEZED_AFTER} > now()`)
    .left_join(tableDangerClasses.NAME, 'dc', `dc.id = c.${cols.DANGER_CLASS_ID}`)
    .left_join(tableVehicleClasses.NAME, 'vc', `vc.id = c.${cols.VEHICLE_TYPE_ID}`)
    .toString();

const selectRecordByIdWithCoordinatesAndEconomicSettings = (id, userLanguageId) => squelPostgres
    .select()
    .field('c.*')
    .field(`json_build_object(
            '${colsEconomicSettings.PERCENT_FROM_TRANSPORTER}', ${colsEconomicSettings.PERCENT_FROM_TRANSPORTER},
            '${colsEconomicSettings.PERCENT_FROM_HOLDER}', ${colsEconomicSettings.PERCENT_FROM_HOLDER}
        )`, HOMELESS_COLUMNS.ECONOMIC_SETTINGS)
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
    .where(`c.${cols.FREEZED_AFTER} > now()`)
    .left_join(tableDangerClasses.NAME, 'dc', `dc.id = c.${cols.DANGER_CLASS_ID}`)
    .left_join(tableVehicleClasses.NAME, 'vc', `vc.id = c.${cols.VEHICLE_TYPE_ID}`)
    .left_join(tableEconomicSettings.NAME, 'es', `es.${colsEconomicSettings.COMPANY_ID} = c.${cols.COMPANY_ID}`)
    .toString();

const selectRecordByIdLight = id => squelPostgres
    .select()
    .from(table.NAME)
    .where(`id = '${id}'`)
    .where(`${cols.DELETED} = 'f'`)
    .where(`${cols.FREEZED_AFTER} > now()`)
    .toString();

const selectRecordsByCompanyId = companyId => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.COMPANY_ID} = '${companyId}'`)
    .where(`${cols.DELETED} = 'f'`)
    .where(`${cols.FREEZED_AFTER} > now()`)
    .toString();

const selectCargosByCompanyIdPaginationSorting = (companyId, limit, offset, sortColumn, asc, filter, userLanguageId) => {
    let expression = squelPostgres
        .select()
        .field('c.*')
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
        .where(`c.${cols.DELETED} = 'f'`)
        .where(`c.${cols.FREEZED_AFTER} > now()`);

    expression = setCargosFilter(expression, filter);
    return expression
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
        .where(`c.${cols.DELETED} = 'f'`)
        .where(`c.${cols.FREEZED_AFTER} > now()`);

    expression = setCargosFilter(expression, filter);
    return expression
        .toString();
};

const setCargosFilter = (expression, filteringObject) => {
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

const selectRecordsForSearch = ({ upGeo, downGeo, geoLine }, { uploadingDate, downloadingDate }, searchRadius, languageId, companyId, filter = {}) => {
    let expression = squelPostgres
        .select()
        .from(table.NAME, 'c')
        .field('c.*')
        .field(`c.${cols.FREE_COUNT}`, cols.COUNT)
        .field(`vc.${colsVehicleClasses.NAME}`, HOMELESS_COLUMNS.VEHICLE_TYPE_NAME)
        .field(`dc.${colsDangerClasses.NAME}`, HOMELESS_COLUMNS.DANGER_CLASS_NAME)
        .field(`json_build_object(
            '${colsEconomicSettings.PERCENT_FROM_TRANSPORTER}', ${colsEconomicSettings.PERCENT_FROM_TRANSPORTER},
            '${colsEconomicSettings.PERCENT_FROM_HOLDER}', ${colsEconomicSettings.PERCENT_FROM_HOLDER}
        )`, HOMELESS_COLUMNS.ECONOMIC_SETTINGS)
        .field(`ARRAY(${
            squelPostgres
                .select()
                .field(`row_to_json(row(
            cpr.${colsCargoPrices.CURRENCY_ID}, cpr.${colsCargoPrices.NEXT_CURRENCY_ID}, cpr.${colsCargoPrices.PRICE}, cur.${colsCurrencies.CODE}
            ))`)
                .from(tableCargoPrices.NAME, 'cpr')
                .where(`cpr.${colsCargoPrices.CARGO_ID} = c.id`)
                .left_join(tableCurrencies.NAME, 'cur', `cur.id = cpr.${colsCargoPrices.CURRENCY_ID}`)
                .toString()
        })`, HOMELESS_COLUMNS.PRICES);

    if (downGeo) {
        expression
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
                            .and(`ST_Distance(${upGeo}, cp.${colsCargoPoints.COORDINATES}) <= ${searchRadius * 1000}`)
                            .or(`ST_Distance(${downGeo}, cp.${colsCargoPoints.COORDINATES}) <= ${searchRadius * 1000}`)
                            .or(`ST_DWithin(ST_Buffer(${geoLine}, ${CARGO_SEARCH_LINE_RADIUS_KM * 1000}), cp.${colsCargoPoints.COORDINATES}, 0)`)
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
            })`, HOMELESS_COLUMNS.ALL_UPLOADING_POINTS) // todo: find out better algorithm for it
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
                            .and(`ST_Distance(${upGeo}, cp.${colsCargoPoints.COORDINATES}) <= ${searchRadius * 1000}`)
                            .or(`ST_Distance(${downGeo}, cp.${colsCargoPoints.COORDINATES}) <= ${searchRadius * 1000}`)
                            .or(`ST_DWithin(ST_Buffer(${geoLine}, ${CARGO_SEARCH_LINE_RADIUS_KM * 1000}), cp.${colsCargoPoints.COORDINATES}, 0)`)
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
            })`, HOMELESS_COLUMNS.ALL_DOWNLOADING_POINTS);
    } else {
        expression
            .field(`ARRAY(${
                squelPostgres
                    .select()
                    .field(`row_to_json(row(ST_AsText(cp.${colsCargoPoints.COORDINATES}), t.${colsTranslations.VALUE}, t.${colsTranslations.LANGUAGE_ID}))`)
                    .from(tableCargoPoints.NAME, 'cp')
                    .where(`cp.${colsCargoPoints.CARGO_ID} = c.id`)
                    .where(`cp.${colsCargoPoints.TYPE} = 'upload'`)
                    .where(`t.${colsTranslations.LANGUAGE_ID} = '${languageId}' OR t.${colsTranslations.LANGUAGE_ID} = (SELECT id FROM languages WHERE code = 'en')`)
                    .where(`ST_Distance(${upGeo}, cp.${colsCargoPoints.COORDINATES}) <= ${searchRadius * 1000}`)
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
                    .left_join(tablePoints.NAME, 'p', `p.${colsPoints.COORDINATES} = cp.${colsCargoPoints.COORDINATES}`)
                    .left_join(tableTranslations.NAME, 't', `t.${colsTranslations.POINT_ID} = p.id`)
                    .toString()
            })`, HOMELESS_COLUMNS.DOWNLOADING_POINTS);
    }

    if (uploadingDate) {
        expression
            .where(`(c.${cols.UPLOADING_DATE_TO} IS NOT NULL AND '${uploadingDate}' <= c.${cols.UPLOADING_DATE_TO}) OR
                c.${cols.UPLOADING_DATE_TO} IS NULL
            `);
    }
    if (downloadingDate) {
        expression
            .where(`(c.${cols.DOWNLOADING_DATE_FROM} IS NOT NULL AND '${downloadingDate}' >= c.${cols.DOWNLOADING_DATE_FROM}) OR
                c.${cols.DOWNLOADING_DATE_FROM} IS NULL
            `);
    }
    if (companyId) {
        expression
            .where(`c.${cols.COMPANY_ID} <> '${companyId}'`);
    }

    expression
        .where(`c.${cols.FREE_COUNT} > 0`)
        .where(`c.${cols.FREEZED_AFTER} > now()`)
        .where(`c.${cols.DELETED} = 'f'`);

    expression = setCargosSearchFilter(expression, filter);
    return expression
        .left_join(tableVehicleClasses.NAME, 'vc', `vc.id = c.${cols.VEHICLE_TYPE_ID}`)
        .left_join(tableDangerClasses.NAME, 'dc', `dc.id = c.${cols.DANGER_CLASS_ID}`)
        .left_join(tableEconomicSettings.NAME, 'es', `es.${colsEconomicSettings.COMPANY_ID} = c.${cols.COMPANY_ID}`)
        .toString();
};

const setCargosSearchFilter = (expression, filteringObject) => {
    const filteringObjectSQLExpressions = [
        [cols.GROSS_WEIGHT, `c.${cols.GROSS_WEIGHT} <= ${filteringObject[cols.GROSS_WEIGHT]}`],
        [cols.WIDTH, `c.${cols.WIDTH} <= ${filteringObject[cols.WIDTH]}`],
        [cols.HEIGHT, `c.${cols.HEIGHT} <= ${filteringObject[cols.HEIGHT]}`],
        [cols.LENGTH, `c.${cols.LENGTH} <= ${filteringObject[cols.LENGTH]}`],
        [cols.LOADING_TYPE, `c.${cols.LOADING_TYPE} = ${filteringObject[cols.LOADING_TYPE]}`],
        [cols.VEHICLE_TYPE_ID, `c.${cols.VEHICLE_TYPE_ID} = '${filteringObject[cols.VEHICLE_TYPE_ID]}'`],
        [cols.DANGER_CLASS_ID, `c.${cols.DANGER_CLASS_ID} = '${filteringObject[cols.DANGER_CLASS_ID]}'`],
        [cols.LOADING_METHODS, `c.${cols.LOADING_METHODS} @> '{${filteringObject[cols.LOADING_METHODS]}}'`],
        [cols.GUARANTEES, `c.${cols.GUARANTEES} @> '{${filteringObject[cols.GUARANTEES]}}'`],
    ];

    for (let [key, exp] of filteringObjectSQLExpressions) {
        if (get(filteringObject, key) !== undefined) {
            expression = expression.where(exp);
        }
    }
    return expression;
};

const selectAllNewRecordsForSearch = (languageId, companyId) => {
    const expression = squelPostgres
        .select()
        .from(table.NAME, 'c')
        .field('c.*')
        .field(`vc.${colsVehicleClasses.NAME}`, HOMELESS_COLUMNS.VEHICLE_TYPE_NAME)
        .field(`dc.${colsDangerClasses.NAME}`, HOMELESS_COLUMNS.DANGER_CLASS_NAME)
        .field(`json_build_object(
            '${colsEconomicSettings.PERCENT_FROM_TRANSPORTER}', ${colsEconomicSettings.PERCENT_FROM_TRANSPORTER},
            '${colsEconomicSettings.PERCENT_FROM_HOLDER}', ${colsEconomicSettings.PERCENT_FROM_HOLDER}
        )`, HOMELESS_COLUMNS.ECONOMIC_SETTINGS)
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
                .where(`t.${colsTranslations.LANGUAGE_ID} = '${languageId}' OR t.${colsTranslations.LANGUAGE_ID} = (SELECT id FROM languages WHERE code = 'en')`)
                .left_join(tablePoints.NAME, 'p', `p.${colsPoints.COORDINATES} = cp.${colsCargoPoints.COORDINATES}`)
                .left_join(tableTranslations.NAME, 't', `t.${colsTranslations.POINT_ID} = p.id`)
                .toString()
        })`, HOMELESS_COLUMNS.DOWNLOADING_POINTS);

    if (companyId) {
        expression
            .where(`c.${cols.COMPANY_ID} <> '${companyId}'`);
    }

    return expression
        .where(`c.${cols.FREE_COUNT} > 0`)
        .where(`c.${cols.FREEZED_AFTER} > now()`)
        .where(`c.${cols.DELETED} = 'f'`)
        .left_join(tableVehicleClasses.NAME, 'vc', `vc.id = c.${cols.VEHICLE_TYPE_ID}`)
        .left_join(tableDangerClasses.NAME, 'dc', `dc.id = c.${cols.DANGER_CLASS_ID}`)
        .left_join(tableEconomicSettings.NAME, 'es', `es.${colsEconomicSettings.COMPANY_ID} = c.${cols.COMPANY_ID}`)
        .toString();
};

const selectAvailableCargosByIds = ids => squelPostgres // todo: full check of availability
    .select()
    .field('c.*')
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
    .from(table.NAME, 'c')
    .where('c.id IN ?', ids)
    .where(`c.${cols.DELETED} = 'f'`)
    .where(`c.${cols.FREEZED_AFTER} > now()`)
    .toString();

module.exports = {
    insertRecord,
    updateRecordById,
    deleteRecordById,
    selectRecordById,
    selectRecordByWithCoordinatesId,
    selectRecordByIdWithCoordinatesAndEconomicSettings,
    selectRecordByIdLight,
    selectRecordsByCompanyId,
    selectCargosByCompanyIdPaginationSorting,
    selectCountCargosByCompanyId,
    selectRecordsForSearch,
    selectAllNewRecordsForSearch,
    selectAvailableCargosByIds,
};
