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
const tableCars = SQL_TABLES.CARS;
const tableTrailers = SQL_TABLES.TRAILERS;
const tableDrivers = SQL_TABLES.DRIVERS;
const tableUsers = SQL_TABLES.USERS;
const tablePhoneNumbers = SQL_TABLES.PHONE_NUMBERS;
const tablePhonePrefixes = SQL_TABLES.PHONE_PREFIXES;

const cols = table.COLUMNS;
const colsCargos = tableCargos.COLUMNS;
const colsCargoPoints = tableCargoPoints.COLUMNS;
const colsPoints = tablePoints.COLUMNS;
const colsTranslations = tableTranslations.COLUMNS;
const colsDealStatuses = tableDealStatuses.COLUMNS;
const colsDealHistory = tableDealHistory.COLUMNS;
const colsCars = tableCars.COLUMNS;
const colsTrailers = tableTrailers.COLUMNS;
const colsDrivers = tableDrivers.COLUMNS;
const colsUsers = tableUsers.COLUMNS;
const colsPhoneNumbers = tablePhoneNumbers.COLUMNS;
const colsPhonePrefixes = tablePhonePrefixes.COLUMNS;

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


const selectRecordById = (id, userLanguageId) => squelPostgres
    .select()
    .field('d.*')
    .field(`c.${colsCargos.UPLOADING_DATE_FROM}`, colsCargos.UPLOADING_DATE_FROM)
    .field(`c.${colsCargos.UPLOADING_DATE_TO}`, colsCargos.UPLOADING_DATE_TO)
    .field(`c.${colsCargos.DOWNLOADING_DATE_FROM}`, colsCargos.DOWNLOADING_DATE_FROM)
    .field(`c.${colsCargos.DOWNLOADING_DATE_TO}`, colsCargos.DOWNLOADING_DATE_TO)
    .field(`c.${colsCargos.GROSS_WEIGHT}`, colsCargos.GROSS_WEIGHT)
    .field(`c.${colsCargos.DISTANCE}`, colsCargos.DISTANCE)
    .field(`c.${colsCargos.WIDTH}`, colsCargos.WIDTH)
    .field(`c.${colsCargos.HEIGHT}`, colsCargos.HEIGHT)
    .field(`c.${colsCargos.LENGTH}`, colsCargos.LENGTH)
    .field(`cr.${colsCars.CAR_MARK}`, colsCars.CAR_MARK)
    .field(`cr.${colsCars.CAR_MODEL}`, colsCars.CAR_MODEL)
    .field(`cr.${colsCars.CAR_WIDTH}`, colsCars.CAR_WIDTH)
    .field(`cr.${colsCars.CAR_HEIGHT}`, colsCars.CAR_HEIGHT)
    .field(`cr.${colsCars.CAR_LENGTH}`, colsCars.CAR_LENGTH)
    .field(`cr.${colsCars.CAR_CARRYING_CAPACITY}`, colsCars.CAR_CARRYING_CAPACITY)
    .field('t.id', 'trailer_id')
    .field(`t.${colsTrailers.TRAILER_MARK}`, colsTrailers.TRAILER_MARK)
    .field(`t.${colsTrailers.TRAILER_MODEL}`, colsTrailers.TRAILER_MODEL)
    .field(`t.${colsTrailers.TRAILER_WIDTH}`, colsTrailers.TRAILER_WIDTH)
    .field(`t.${colsTrailers.TRAILER_HEIGHT}`, colsTrailers.TRAILER_HEIGHT)
    .field(`t.${colsTrailers.TRAILER_LENGTH}`, colsTrailers.TRAILER_LENGTH)
    .field(`t.${colsTrailers.TRAILER_CARRYING_CAPACITY}`, colsTrailers.TRAILER_CARRYING_CAPACITY)
    .field('dr.id', 'driver_id')
    .field(`u.${colsUsers.FULL_NAME}`, colsUsers.FULL_NAME)
    .field(`CONCAT(php.${colsPhonePrefixes.CODE}, phn.${colsPhoneNumbers.NUMBER})::bigint`, HOMELESS_COLUMNS.FULL_PHONE_NUMBER)
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
    .field(`ds.${colsDealStatuses.NAME}`, HOMELESS_COLUMNS.DEAL_STATUS)
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
    .left_join(tableDealStatuses.NAME, 'ds', `ds.id = dsh.${colsDealHistory.DEAL_STATUS_ID}`)
    .left_join(tablePhoneNumbers.NAME, 'phn', `phn.${colsPhoneNumbers.USER_ID} = u.id`)
    .left_join(tablePhonePrefixes.NAME, 'php', `php.id = phn.${colsPhoneNumbers.PHONE_PREFIX_ID}`)
    .toString();

module.exports = {
    insertRecords,
    selectDealsByCompanyIdPaginationSorting,
    selectCountDealsByCompanyId,
    setAvailableDealsFilter,
    selectRecordById,
};
