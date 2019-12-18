const squel = require('squel');
const { get } = require('lodash');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.DEALS;

const tableCargos = SQL_TABLES.CARGOS;
const tableCargoPoints = SQL_TABLES.CARGO_POINTS;
const tablePoints = SQL_TABLES.POINTS;
const tableTranslations = SQL_TABLES.POINT_TRANSLATIONS;

const cols = table.COLUMNS;
const colsCargos = tableCargos.COLUMNS;
const colsCargoPoints = tableCargoPoints.COLUMNS;
const colsPoints = tablePoints.COLUMNS;
const colsTranslations = tableTranslations.COLUMNS;

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
    const { dateFrom, dateTo } = filter;
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
        .order(sortColumn, asc)
        .limit(limit)
        .offset(offset)
        .toString();
};

module.exports = {
    insertRecords,
    selectDealsByCompanyIdPaginationSorting,
    selectCountDealsByCompanyId,
    setAvailableDealsFilter,
};
