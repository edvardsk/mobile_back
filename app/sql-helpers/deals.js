const squel = require('squel');
const { get } = require('lodash');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.DEALS;

const tableCargos = SQL_TABLES.CARGOS;
const tableCargoPoints = SQL_TABLES.CARGO_POINTS;
const tablePoints = SQL_TABLES.POINTS;
const tableTranslations = SQL_TABLES.POINT_TRANSLATIONS;
const tableDealStatuses = SQL_TABLES.DEAL_STATUSES;
const tableDealHistory = SQL_TABLES.DEAL_HISTORY_STATUSES;
const tableDealHistoryConfirmations = SQL_TABLES.DEAL_STATUSES_HISTORY_CONFIRMATIONS;
const tableCars = SQL_TABLES.CARS;
const tableDraftCars = SQL_TABLES.DRAFT_CARS;
const tableTrailers = SQL_TABLES.TRAILERS;
const tableDraftTrailers = SQL_TABLES.DRAFT_TRAILERS;
const tableDrivers = SQL_TABLES.DRIVERS;
const tableDraftDrivers = SQL_TABLES.DRAFT_DRIVERS;

const cols = table.COLUMNS;
const colsCargos = tableCargos.COLUMNS;
const colsCargoPoints = tableCargoPoints.COLUMNS;
const colsPoints = tablePoints.COLUMNS;
const colsTranslations = tableTranslations.COLUMNS;
const colsDealStatuses = tableDealStatuses.COLUMNS;
const colsDealHistory = tableDealHistory.COLUMNS;
const colsDealHistoryConfirmations = tableDealHistoryConfirmations.COLUMNS;
const colsCars = tableCars.COLUMNS;
const colsDraftCars = tableDraftCars.COLUMNS;
const colsTrailers = tableTrailers.COLUMNS;
const colsDraftTrailers = tableDraftTrailers.COLUMNS;
const colsDrivers = tableDrivers.COLUMNS;
const colsDraftDrivers = tableDraftDrivers.COLUMNS;

const insertRecords = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFieldsRows(values)
    .returning('*')
    .toString();

const setAvailableDealsFilter = (expression, filteringObject) => {
    const filteringObjectSQLExpressions = [
        [HOMELESS_COLUMNS.NAME, `d.${cols.NAME}::text ILIKE '%${filteringObject[HOMELESS_COLUMNS.NAME]}%'`],
    ];

    for (let [key, exp] of filteringObjectSQLExpressions) {
        if (get(filteringObject, key) !== undefined) {
            expression = expression.where(exp);
        }
    }
    return expression;
};


const selectCountDealsByCompanyId = (companyId, filter) => {
    const { dateFrom, dateTo } = filter;
    let expression = squelPostgres
        .select()
        .field('COUNT(d.id)')
        .from(table.NAME, 'd')
        .where(`c.${colsCargos.COMPANY_ID} = '${companyId}' OR d.${cols.TRANSPORTER_COMPANY_ID} = '${companyId}'`);

    if (dateFrom) {
        expression = expression
            .where(`(c.${colsCargos.UPLOADING_DATE_TO} IS NOT NULL AND '${dateFrom}' <= c.${colsCargos.UPLOADING_DATE_TO}) OR
                c.${colsCargos.UPLOADING_DATE_TO} IS NULL
            `);
    }
    if (dateTo) {
        expression = expression
            .where(`(c.${colsCargos.DOWNLOADING_DATE_FROM} IS NOT NULL AND '${dateTo}' >= c.${colsCargos.DOWNLOADING_DATE_FROM}) OR
                c.${colsCargos.DOWNLOADING_DATE_FROM} IS NULL
            `);
    }

    expression = setAvailableDealsFilter(expression, filter);
    return expression
        .left_join(tableCargos.NAME, 'c', `c.id = d.${cols.CARGO_ID}`)
        .toString();
};

const selectDealsByCompanyIdPaginationSorting = (companyId, limit, offset, sortColumn, asc, filter, userLanguageId) => {
    const { date_from: dateFrom, date_to: dateTo } = filter;
    let expression = squelPostgres
        .select()
        .field('d.*')
        .field(`c.${colsCargos.UPLOADING_DATE_FROM}`)
        .field(`c.${colsCargos.UPLOADING_DATE_TO}`)
        .field(`c.${colsCargos.DOWNLOADING_DATE_FROM}`)
        .field(`c.${colsCargos.DOWNLOADING_DATE_TO}`)
        .field(`ARRAY(${
            squelPostgres
                .select()
                .field(`row_to_json(row(cp.id, ST_AsText(cp.${colsCargoPoints.COORDINATES}), t.${colsTranslations.VALUE}, t.${colsTranslations.LANGUAGE_ID}))`)
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
                .field(`row_to_json(row(cp.id, ST_AsText(cp.${colsCargoPoints.COORDINATES}), t.${colsTranslations.VALUE}, t.${colsTranslations.LANGUAGE_ID}))`)
                .from(tableCargoPoints.NAME, 'cp')
                .where(`cp.${colsCargoPoints.CARGO_ID} = c.id`)
                .where(`cp.${colsCargoPoints.TYPE} = 'download'`)
                .where(`t.${colsTranslations.LANGUAGE_ID} = '${userLanguageId}' OR t.${colsTranslations.LANGUAGE_ID} = (SELECT id FROM languages WHERE code = 'en')`)
                .left_join(tablePoints.NAME, 'p', `p.${colsPoints.COORDINATES} = cp.${colsCargoPoints.COORDINATES}`)
                .left_join(tableTranslations.NAME, 't', `t.${colsTranslations.POINT_ID} = p.id`)
                .toString()
        })`, HOMELESS_COLUMNS.DOWNLOADING_POINTS)
        .field(`ds.${colsDealStatuses.NAME}`, 'status')
        .from(table.NAME, 'd')
        .where('dsh.id = ?',
            squelPostgres
                .select()
                .field('dsh2.id')
                .from(tableDealHistory.NAME, 'dsh2')
                .where(`dsh2.${colsDealHistory.DEAL_ID} = d.id`)
                .order(`dsh2.${colsDealHistory.CREATED_AT}`, false)
                .limit(1)
        )
        .where(`c.${colsCargos.COMPANY_ID} = '${companyId}' OR d.${cols.TRANSPORTER_COMPANY_ID} = '${companyId}'`);

    if (dateFrom) {
        expression = expression
            .where(`(c.${colsCargos.UPLOADING_DATE_TO} IS NOT NULL AND '${dateFrom}' <= c.${colsCargos.UPLOADING_DATE_TO}) OR
                c.${colsCargos.UPLOADING_DATE_TO} IS NULL
            `);
    }
    if (dateTo) {
        expression = expression
            .where(`(c.${colsCargos.DOWNLOADING_DATE_FROM} IS NOT NULL AND '${dateTo}' >= c.${colsCargos.DOWNLOADING_DATE_FROM}) OR
                c.${colsCargos.DOWNLOADING_DATE_FROM} IS NULL
            `);
    }

    expression = setAvailableDealsFilter(expression, filter);
    return expression
        .left_join(tableCargos.NAME, 'c', `c.id = d.${cols.CARGO_ID}`)
        .left_join(tableDealHistory.NAME, 'dsh', `dsh.${colsDealHistory.DEAL_ID} = d.id`)
        .left_join(tableDealStatuses.NAME, 'ds', `ds.id = dsh.${colsDealHistory.DEAL_STATUS_ID}`)
        .order(sortColumn, asc)
        .limit(limit)
        .offset(offset)
        .toString();
};

const selectRecordById = id => squelPostgres
    .select()
    .field('d.*')
    .field(`c.${colsCargos.COMPANY_ID}`)
    .field(`ds.${colsDealStatuses.NAME}`, HOMELESS_COLUMNS.DEAL_STATUS_NAME)
    .field(`dsc.${colsDealHistoryConfirmations.CONFIRMED_BY_TRANSPORTER}`, colsDealHistoryConfirmations.CONFIRMED_BY_TRANSPORTER)
    .field(`dsc.${colsDealHistoryConfirmations.CONFIRMED_BY_HOLDER}`, colsDealHistoryConfirmations.CONFIRMED_BY_HOLDER)
    .from(table.NAME, 'd')
    .where(`d.id = '${id}'`)
    .left_join(tableCargos.NAME, 'c', `c.id = d.${cols.CARGO_ID}`)
    .left_join(tableDealHistory.NAME, 'dh', `dh.${colsDealHistory.DEAL_ID} = d.id`)
    .left_join(tableDealStatuses.NAME, 'ds', `ds.id = dh.${colsDealHistory.DEAL_STATUS_ID}`)
    .left_join(tableDealHistoryConfirmations.NAME, 'dsc', `dsc.${colsDealHistoryConfirmations.DEAL_STATUS_HISTORY_ID} = dh.id`)
    .order(`dh.${colsDealHistory.CREATED_AT}`, false)
    .limit(1)
    .toString();

const selectRecordWithInstancesInfoById = id => squelPostgres
    .select()
    .field('d.*')
    .field(`c.${colsCargos.COMPANY_ID}`)

    .field(`crs.${colsCars.SHADOW}`, HOMELESS_COLUMNS.CAR_SHADOW)
    .field(`crs.${colsCars.VERIFIED}`, HOMELESS_COLUMNS.CAR_VERIFIED)
    .field('dcrs.id', HOMELESS_COLUMNS.DRAFT_CAR_ID)

    .field(`t.${colsTrailers.SHADOW}`, HOMELESS_COLUMNS.TRAILER_SHADOW)
    .field(`t.${colsTrailers.VERIFIED}`, HOMELESS_COLUMNS.TRAILER_VERIFIED)
    .field('dt.id', HOMELESS_COLUMNS.DRAFT_TRAILER_ID)

    .field(`dr.${colsDrivers.SHADOW}`, HOMELESS_COLUMNS.TRAILER_SHADOW)
    .field(`dr.${colsDrivers.VERIFIED}`, HOMELESS_COLUMNS.TRAILER_VERIFIED)
    .field('ddr.id', HOMELESS_COLUMNS.DRAFT_TRAILER_ID)

    .from(table.NAME, 'd')
    .where(`d.id = '${id}'`)
    .left_join(tableCargos.NAME, 'c', `c.id = d.${cols.CARGO_ID}`)
    .left_join(tableCars.NAME, 'crs', `crs.id = d.${cols.CAR_ID}`)
    .left_join(tableDraftCars.NAME, 'dcrs', `dcrs.${colsDraftCars.CAR_ID} = d.${cols.CAR_ID}`)
    .left_join(tableTrailers.NAME, 't', `t.id = d.${cols.TRAILER_ID}`)
    .left_join(tableDraftTrailers.NAME, 'dt', `dt.${colsDraftTrailers.TRAILER_ID} = d.${cols.TRAILER_ID}`)
    .left_join(tableDrivers.NAME, 'dr', `dr.id = d.${cols.DRIVER_ID}`)
    .left_join(tableDraftDrivers.NAME, 'ddr', `ddr.${colsDraftDrivers.DRIVER_ID} = d.${cols.DRIVER_ID}`)
    .toString();

module.exports = {
    insertRecords,
    selectDealsByCompanyIdPaginationSorting,
    selectCountDealsByCompanyId,
    setAvailableDealsFilter,
    selectRecordById,
    selectRecordWithInstancesInfoById,
};
