const squel = require('squel');
const { get } = require('lodash');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { IN_WORK_STATUSES_LIST } = require('constants/deal-statuses');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.DEALS;

const tableCargos = SQL_TABLES.CARGOS;
const tableCargoPoints = SQL_TABLES.CARGO_POINTS;
const tablePoints = SQL_TABLES.POINTS;
const tableTranslations = SQL_TABLES.POINT_TRANSLATIONS;
const tableDealStatuses = SQL_TABLES.DEAL_STATUSES;
const tableDealHistory = SQL_TABLES.DEAL_HISTORY_STATUSES;
const tableDealPointsInfo = SQL_TABLES.DEAL_POINTS_INFO;
const tableCars = SQL_TABLES.CARS;
const tableTrailers = SQL_TABLES.TRAILERS;
const tableDrivers = SQL_TABLES.DRIVERS;
const tableUsers = SQL_TABLES.USERS;
const tablePhoneNumbers = SQL_TABLES.PHONE_NUMBERS;
const tablePhonePrefixes = SQL_TABLES.PHONE_PREFIXES;
const tableDealHistoryConfirmations = SQL_TABLES.DEAL_STATUSES_HISTORY_CONFIRMATIONS;
const tableDraftCars = SQL_TABLES.DRAFT_CARS;
const tableDraftTrailers = SQL_TABLES.DRAFT_TRAILERS;
const tableDraftDrivers = SQL_TABLES.DRAFT_DRIVERS;
const tableCargoPrices = SQL_TABLES.CARGO_PRICES;
const tableCurrencies = SQL_TABLES.CURRENCIES;
const tableCarsStateNumbers = SQL_TABLES.CARS_STATE_NUMBERS;
const tableTrailersNumbers = SQL_TABLES.TRAILERS_STATE_NUMBERS;

const cols = table.COLUMNS;
const colsCargos = tableCargos.COLUMNS;
const colsCargoPoints = tableCargoPoints.COLUMNS;
const colsPoints = tablePoints.COLUMNS;
const colsTranslations = tableTranslations.COLUMNS;
const colsDealStatuses = tableDealStatuses.COLUMNS;
const colsDealHistory = tableDealHistory.COLUMNS;
const colsDealPointsInfo = tableDealPointsInfo.COLUMNS;
const colsCars = tableCars.COLUMNS;
const colsTrailers = tableTrailers.COLUMNS;
const colsDrivers = tableDrivers.COLUMNS;
const colsUsers = tableUsers.COLUMNS;
const colsPhoneNumbers = tablePhoneNumbers.COLUMNS;
const colsPhonePrefixes = tablePhonePrefixes.COLUMNS;
const colsDealHistoryConfirmations = tableDealHistoryConfirmations.COLUMNS;
const colsDraftCars = tableDraftCars.COLUMNS;
const colsDraftTrailers = tableDraftTrailers.COLUMNS;
const colsDraftDrivers = tableDraftDrivers.COLUMNS;
const colsCargoPrices = tableCargoPrices.COLUMNS;
const colsCurrencies = tableCurrencies.COLUMNS;
const colsCarsStateNumbers = tableCarsStateNumbers.COLUMNS;
const colsTrailersNumbers = tableTrailersNumbers.COLUMNS;

const insertRecords = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFieldsRows(values)
    .returning('*')
    .toString();

const updateRecord = (id, data) => squelPostgres
    .update()
    .table(table.NAME)
    .setFields(data)
    .where(`id = '${id}'`)
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
    const { date_from: dateFrom, date_to: dateTo, status } = filter;
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
        .field(`ds.${colsDealStatuses.NAME}`, HOMELESS_COLUMNS.DEAL_STATUS)
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

    if (status) {
        expression = expression
            .where(`ds.${colsDealStatuses.NAME} = '${status}'`);
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
    .field('dsc.id', HOMELESS_COLUMNS.DEAL_STATUS_CONFIRMATION_ID)
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

const selectFullRecordById = (id, userLanguageId) => squelPostgres
    .select()
    .field('d.*')
    // cargo
    .field(`c.${colsCargos.UPLOADING_DATE_FROM}`, colsCargos.UPLOADING_DATE_FROM)
    .field(`c.${colsCargos.UPLOADING_DATE_TO}`, colsCargos.UPLOADING_DATE_TO)
    .field(`c.${colsCargos.DOWNLOADING_DATE_FROM}`, colsCargos.DOWNLOADING_DATE_FROM)
    .field(`c.${colsCargos.DOWNLOADING_DATE_TO}`, colsCargos.DOWNLOADING_DATE_TO)
    .field(`c.${colsCargos.GROSS_WEIGHT}`, colsCargos.GROSS_WEIGHT)
    .field(`c.${colsCargos.DISTANCE}`, colsCargos.DISTANCE)
    .field(`c.${colsCargos.WIDTH}`, colsCargos.WIDTH)
    .field(`c.${colsCargos.HEIGHT}`, colsCargos.HEIGHT)
    .field(`c.${colsCargos.LENGTH}`, colsCargos.LENGTH)
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
    // car
    .field(`cr.${colsCars.CAR_MARK}`, colsCars.CAR_MARK)
    .field(`cr.${colsCars.CAR_MODEL}`, colsCars.CAR_MODEL)
    .field(`cr.${colsCars.CAR_WIDTH}`, colsCars.CAR_WIDTH)
    .field(`cr.${colsCars.CAR_HEIGHT}`, colsCars.CAR_HEIGHT)
    .field(`cr.${colsCars.CAR_LENGTH}`, colsCars.CAR_LENGTH)
    .field(`cr.${colsCars.CAR_CARRYING_CAPACITY}`, colsCars.CAR_CARRYING_CAPACITY)
    .field(`csn.${colsCarsStateNumbers.NUMBER}`, HOMELESS_COLUMNS.CAR_STATE_NUMBER)
    // trailer
    .field('t.id', 'trailer_id')
    .field(`t.${colsTrailers.TRAILER_MARK}`, colsTrailers.TRAILER_MARK)
    .field(`t.${colsTrailers.TRAILER_MODEL}`, colsTrailers.TRAILER_MODEL)
    .field(`t.${colsTrailers.TRAILER_WIDTH}`, colsTrailers.TRAILER_WIDTH)
    .field(`t.${colsTrailers.TRAILER_HEIGHT}`, colsTrailers.TRAILER_HEIGHT)
    .field(`t.${colsTrailers.TRAILER_LENGTH}`, colsTrailers.TRAILER_LENGTH)
    .field(`t.${colsTrailers.TRAILER_CARRYING_CAPACITY}`, colsTrailers.TRAILER_CARRYING_CAPACITY)
    .field(`tsn.${colsTrailersNumbers.NUMBER}`, HOMELESS_COLUMNS.TRAILER_STATE_NUMBER)
    // driver
    .field('dr.id', 'driver_id')
    .field(`u.${colsUsers.FULL_NAME}`, colsUsers.FULL_NAME)
    .field(`CONCAT(php.${colsPhonePrefixes.CODE}, phn.${colsPhoneNumbers.NUMBER})`, HOMELESS_COLUMNS.FULL_PHONE_NUMBER)
    // deal info
    .field(`ARRAY(${
        squelPostgres
            .select()
            .field(`row_to_json(row(cp.id, ST_AsText(cp.${colsCargoPoints.COORDINATES}), t.${colsTranslations.VALUE}, t.${colsTranslations.LANGUAGE_ID}, dpi.${colsDealPointsInfo.POINT_ADDRESS}, dpi.${colsDealPointsInfo.POINT_PERSON_FULL_NAME}, dpi.${colsDealPointsInfo.POINT_PERSON_FULL_PHONE_NUMBER}))`)
            .from(tableCargoPoints.NAME, 'cp')
            .where(`cp.${colsCargoPoints.CARGO_ID} = c.id`)
            .where(`cp.${colsCargoPoints.TYPE} = 'upload'`)
            .where(`t.${colsTranslations.LANGUAGE_ID} = '${userLanguageId}' OR t.${colsTranslations.LANGUAGE_ID} = (SELECT id FROM languages WHERE code = 'en')`)
            .left_join(tablePoints.NAME, 'p', `p.${colsPoints.COORDINATES} = cp.${colsCargoPoints.COORDINATES}`)
            .left_join(tableTranslations.NAME, 't', `t.${colsTranslations.POINT_ID} = p.id`)
            .left_join(tableDealPointsInfo.NAME, 'dpi', `dpi.${colsDealPointsInfo.CARGO_POINT_ID} = cp.id`)
            .toString()
    })`, HOMELESS_COLUMNS.UPLOADING_POINTS)
    .field(`ARRAY(${
        squelPostgres
            .select()
            .field(`row_to_json(row(cp.id, ST_AsText(cp.${colsCargoPoints.COORDINATES}), t.${colsTranslations.VALUE}, t.${colsTranslations.LANGUAGE_ID}, dpi.${colsDealPointsInfo.POINT_ADDRESS}, dpi.${colsDealPointsInfo.POINT_PERSON_FULL_NAME}, dpi.${colsDealPointsInfo.POINT_PERSON_FULL_PHONE_NUMBER}))`)
            .from(tableCargoPoints.NAME, 'cp')
            .where(`cp.${colsCargoPoints.CARGO_ID} = c.id`)
            .where(`cp.${colsCargoPoints.TYPE} = 'download'`)
            .where(`t.${colsTranslations.LANGUAGE_ID} = '${userLanguageId}' OR t.${colsTranslations.LANGUAGE_ID} = (SELECT id FROM languages WHERE code = 'en')`)
            .left_join(tablePoints.NAME, 'p', `p.${colsPoints.COORDINATES} = cp.${colsCargoPoints.COORDINATES}`)
            .left_join(tableTranslations.NAME, 't', `t.${colsTranslations.POINT_ID} = p.id`)
            .left_join(tableDealPointsInfo.NAME, 'dpi', `dpi.${colsDealPointsInfo.CARGO_POINT_ID} = cp.id`)
            .toString()
    })`, HOMELESS_COLUMNS.DOWNLOADING_POINTS)
    .field(`ds.${colsDealStatuses.NAME}`, HOMELESS_COLUMNS.DEAL_STATUS)
    .field(`dsc.${colsDealHistoryConfirmations.CONFIRMED_BY_TRANSPORTER}`, colsDealHistoryConfirmations.CONFIRMED_BY_TRANSPORTER)
    .field(`dsc.${colsDealHistoryConfirmations.CONFIRMED_BY_HOLDER}`, colsDealHistoryConfirmations.CONFIRMED_BY_HOLDER)
    .from(table.NAME, 'd')
    .where(`d.id = '${id}'`)
    .where('dsh.id = ?',
        squelPostgres
            .select()
            .field('dsh2.id')
            .from(tableDealHistory.NAME, 'dsh2')
            .where(`dsh2.${colsDealHistory.DEAL_ID} = d.id`)
            .order(`dsh2.${colsDealHistory.CREATED_AT}`, false)
            .limit(1)
    )
    .left_join(tableCargos.NAME, 'c', `c.id = d.${cols.CARGO_ID}`)
    .left_join(tableDealHistory.NAME, 'dsh', `dsh.${colsDealHistory.DEAL_ID} = d.id`)
    .left_join(tableCars.NAME, 'cr', `cr.id = d.${cols.CAR_ID}`)
    .left_join(tableDrivers.NAME, 'dr', `dr.id = d.${cols.DRIVER_ID}`)
    .left_join(tableUsers.NAME, 'u', `u.id = dr.${colsDrivers.USER_ID}`)
    .left_join(tableTrailers.NAME, 't', `t.${colsTrailers.CAR_ID} = d.${cols.CAR_ID}`)
    .left_join(tableCarsStateNumbers.NAME, 'csn', `csn.${colsCarsStateNumbers.CAR_ID} = cr.id`)
    .left_join(tableTrailersNumbers.NAME, 'tsn', `tsn.${colsTrailersNumbers.TRAILER_ID} = t.id`)
    .left_join(tableDealStatuses.NAME, 'ds', `ds.id = dsh.${colsDealHistory.DEAL_STATUS_ID}`)
    .left_join(tablePhoneNumbers.NAME, 'phn', `phn.${colsPhoneNumbers.USER_ID} = u.id`)
    .left_join(tablePhonePrefixes.NAME, 'php', `php.id = phn.${colsPhoneNumbers.PHONE_PREFIX_ID}`)
    .left_join(tableDealHistoryConfirmations.NAME, 'dsc', `dsc.${colsDealHistoryConfirmations.DEAL_STATUS_HISTORY_ID} = dsh.id`)
    .limit(1)
    .toString();

const selectRecordWithInstancesInfoById = id => squelPostgres
    .select()
    .field('d.*')
    .field(`c.${colsCargos.COMPANY_ID}`)
    .field(`c.${colsCargos.GROSS_WEIGHT}`)
    .field(`c.${colsCargos.WIDTH}`)
    .field(`c.${colsCargos.HEIGHT}`)
    .field(`c.${colsCargos.LENGTH}`)
    .field(`c.${colsCargos.UPLOADING_DATE_FROM}`)
    .field(`c.${colsCargos.DOWNLOADING_DATE_TO}`)
    .field(`c.${colsCargos.LOADING_TYPE}`)

    .field(`ds.${colsDealStatuses.NAME}`, HOMELESS_COLUMNS.DEAL_STATUS_NAME)
    .field('dsc.id', HOMELESS_COLUMNS.DEAL_STATUS_CONFIRMATION_ID)
    .field(`dsc.${colsDealHistoryConfirmations.CONFIRMED_BY_TRANSPORTER}`, colsDealHistoryConfirmations.CONFIRMED_BY_TRANSPORTER)
    .field(`dsc.${colsDealHistoryConfirmations.CONFIRMED_BY_HOLDER}`, colsDealHistoryConfirmations.CONFIRMED_BY_HOLDER)


    .field(`crs.${colsCars.SHADOW}`, HOMELESS_COLUMNS.CAR_SHADOW)
    .field(`crs.${colsCars.VERIFIED}`, HOMELESS_COLUMNS.CAR_VERIFIED)
    .field('dcrs.id', HOMELESS_COLUMNS.DRAFT_CAR_ID)

    .field(`t.${colsTrailers.SHADOW}`, HOMELESS_COLUMNS.TRAILER_SHADOW)
    .field(`t.${colsTrailers.VERIFIED}`, HOMELESS_COLUMNS.TRAILER_VERIFIED)
    .field('dt.id', HOMELESS_COLUMNS.DRAFT_TRAILER_ID)

    .field(`dr.${colsDrivers.SHADOW}`, HOMELESS_COLUMNS.DRIVER_SHADOW)
    .field(`dr.${colsDrivers.VERIFIED}`, HOMELESS_COLUMNS.DRIVER_VERIFIED)
    .field('ddr.id', HOMELESS_COLUMNS.DRAFT_DRIVER_ID)

    .from(table.NAME, 'd')
    .where(`d.id = '${id}'`)
    .left_join(tableCargos.NAME, 'c', `c.id = d.${cols.CARGO_ID}`)

    .left_join(tableDealHistory.NAME, 'dh', `dh.${colsDealHistory.DEAL_ID} = d.id`)
    .left_join(tableDealStatuses.NAME, 'ds', `ds.id = dh.${colsDealHistory.DEAL_STATUS_ID}`)
    .left_join(tableDealHistoryConfirmations.NAME, 'dsc', `dsc.${colsDealHistoryConfirmations.DEAL_STATUS_HISTORY_ID} = dh.id`)

    .left_join(tableCars.NAME, 'crs', `crs.id = d.${cols.CAR_ID}`)
    .left_join(tableDraftCars.NAME, 'dcrs', `dcrs.${colsDraftCars.CAR_ID} = d.${cols.CAR_ID}`)
    .left_join(tableTrailers.NAME, 't', `t.id = d.${cols.TRAILER_ID}`)
    .left_join(tableDraftTrailers.NAME, 'dt', `dt.${colsDraftTrailers.TRAILER_ID} = d.${cols.TRAILER_ID}`)
    .left_join(tableDrivers.NAME, 'dr', `dr.id = d.${cols.DRIVER_ID}`)
    .left_join(tableDraftDrivers.NAME, 'ddr', `ddr.${colsDraftDrivers.DRIVER_ID} = d.${cols.DRIVER_ID}`)

    .order(`dh.${colsDealHistory.CREATED_AT}`, false)
    .limit(1)
    .toString();

const selectDealsInProcessByRangeAndCarId = (carId, startDate, endDate) => squelPostgres
    .select()
    .field('d.*')
    .field(`c.${colsCargos.GROSS_WEIGHT}`)
    .field(`c.${colsCargos.WIDTH}`)
    .field(`c.${colsCargos.HEIGHT}`)
    .field(`c.${colsCargos.LENGTH}`)

    .from(table.NAME, 'd')
    .where(`d.${cols.CAR_ID} = '${carId}'`)
    .where(
        squel
            .expr()
            .and(`c.${colsCargos.UPLOADING_DATE_FROM} >= '${startDate}' AND c.${colsCargos.UPLOADING_DATE_FROM} <= '${endDate}'`)
            .or(`c.${colsCargos.DOWNLOADING_DATE_TO} > '${startDate}' AND c.${colsCargos.DOWNLOADING_DATE_TO} <= '${endDate}'`)
    )
    .where(`ds.${colsDealStatuses.NAME} IN ?`, IN_WORK_STATUSES_LIST)
    .where('dh.id = ?',
        squelPostgres
            .select()
            .field('dh2.id')
            .from(tableDealHistory.NAME, 'dh2')
            .where(`d.id = dh2.${colsDealHistory.DEAL_ID}`)
            .order(`dh2.${colsDealHistory.CREATED_AT}`, false)
            .limit(1)
    )
    .left_join(tableCargos.NAME, 'c', `c.id = d.${cols.CARGO_ID}`)
    .left_join(tableDealHistory.NAME, 'dh', `dh.${colsDealHistory.DEAL_ID} = d.id`)
    .left_join(tableDealStatuses.NAME, 'ds', `ds.id = dh.${colsDealHistory.DEAL_STATUS_ID}`)
    .left_join(tableCars.NAME, 'crs', `crs.id = d.${cols.CAR_ID}`)
    .toString();

module.exports = {
    insertRecords,
    updateRecord,
    selectDealsByCompanyIdPaginationSorting,
    selectCountDealsByCompanyId,
    setAvailableDealsFilter,
    selectFullRecordById,
    selectRecordById,
    selectRecordWithInstancesInfoById,
    selectDealsInProcessByRangeAndCarId,
};
