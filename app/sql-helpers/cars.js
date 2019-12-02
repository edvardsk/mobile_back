const squel = require('squel');
const { get } = require('lodash');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { SqlArray } = require('constants/instances');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.CARS;
const tableCarsStateNumbers = SQL_TABLES.CARS_STATE_NUMBERS;
const tableFiles = SQL_TABLES.FILES;
const tableCarsFiles = SQL_TABLES.CARS_TO_FILES;
const tableVehicleTypes = SQL_TABLES.VEHICLE_TYPES;
const tableDangerClasses = SQL_TABLES.DANGER_CLASSES;
const tableTrailers = SQL_TABLES.TRAILERS;

const cols = table.COLUMNS;
const colsCarsStateNumbers = tableCarsStateNumbers.COLUMNS;
const colsFiles = tableFiles.COLUMNS;
const colsCarsFiles = tableCarsFiles.COLUMNS;
const colsVehicleTypes = tableVehicleTypes.COLUMNS;
const colsDangerClasses = tableDangerClasses.COLUMNS;
const colsTrailers = tableTrailers.COLUMNS;

squelPostgres.registerValueHandler(SqlArray, function(value) {
    return value.toString();
});

const insertRecord = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFields(values)
    .returning('*')
    .toString();

const updateRecord = (id, data) => squelPostgres
    .update()
    .table(table.NAME)
    .setFields(data)
    .where(`id = '${id}'`)
    .returning('*')
    .toString();

const selectRecordById = id => squelPostgres
    .select()
    .from(table.NAME)
    .where(`id = '${id}'`)
    .where(`${cols.DELETED} = 'f'`)
    .toString();

const selectCarsByCompanyIdPaginationSorting = (companyId, limit, offset, sortColumn, asc, filter) => {
    let expression = squelPostgres
        .select()
        .field('c.*')
        .field(`csn.${colsCarsStateNumbers.NUMBER}`, HOMELESS_COLUMNS.CAR_STATE_NUMBER)
        .from(table.NAME, 'c')
        .where(`c.${cols.COMPANY_ID} = '${companyId}'`)
        .where(`c.${cols.DELETED} = 'f'`)
        .where(`csn.${colsCarsStateNumbers.IS_ACTIVE} = 't'`);

    expression = setCarsFilter(expression, filter);
    return expression
        .left_join(tableCarsStateNumbers.NAME, 'csn', `csn.${colsCarsStateNumbers.CAR_ID} = c.id`)
        .order(sortColumn, asc)
        .limit(limit)
        .offset(offset)
        .toString();
};

const selectCountCarsByCompanyId = (companyId, filter) => {
    let expression = squelPostgres
        .select()
        .field('COUNT(c.id)')
        .from(table.NAME, 'c')
        .where(`c.${cols.COMPANY_ID} = '${companyId}'`)
        .where(`c.${cols.DELETED} = 'f'`)
        .where(`csn.${colsCarsStateNumbers.IS_ACTIVE} = 't'`);

    expression = setCarsFilter(expression, filter);
    return expression
        .left_join(tableCarsStateNumbers.NAME, 'csn', `csn.${colsCarsStateNumbers.CAR_ID} = c.id`)
        .toString();
};

const setCarsFilter = (expression, filteringObject) => {
    const filteringObjectSQLExpressions = [
        [HOMELESS_COLUMNS.QUERY, `
            c.${cols.CAR_MARK}::text ILIKE '%${filteringObject[HOMELESS_COLUMNS.QUERY]}%'
            OR
            c.${cols.CAR_MODEL}::text ILIKE '%${filteringObject[HOMELESS_COLUMNS.QUERY]}%'
            OR
            c.${cols.CAR_MADE_YEAR_AT}::text ILIKE '%${filteringObject[HOMELESS_COLUMNS.QUERY]}%'
            OR
            csn.${colsCarsStateNumbers.NUMBER}::text ILIKE '%${filteringObject[HOMELESS_COLUMNS.QUERY]}%'
        `],
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

const selectRecordByStateNumberAndActive = stateNumber => squelPostgres
    .select()
    .from(table.NAME, 'c')
    .field('c.*')
    .where(`csn.${colsCarsStateNumbers.NUMBER} = '${stateNumber}'`)
    .where(`csn.${colsCarsStateNumbers.IS_ACTIVE} = 't'`)
    .left_join(tableCarsStateNumbers.NAME, 'csn', `csn.${colsCarsStateNumbers.CAR_ID} = c.id`)
    .toString();

const selectRecordByIdAndCompanyIdLight = (id, companyId) => squelPostgres
    .select()
    .field('id')
    .from(table.NAME)
    .where(`id = '${id}'`)
    .where(`${cols.COMPANY_ID} = '${companyId}'`)
    .where(`${cols.DELETED} = 'f'`)
    .toString();

const selectRecordByIdFull = id => squelPostgres
    .select()
    .field('c.*')
    .field(`vt.${colsVehicleTypes.NAME}`, HOMELESS_COLUMNS.VEHICLE_TYPE_NAME)
    .field(`dc.${colsDangerClasses.NAME}`, HOMELESS_COLUMNS.DANGER_CLASS_NAME)
    .field(`ARRAY(${
        squelPostgres
            .select()
            .field(`row_to_json(row(f.id, f.${colsFiles.NAME}, f.${colsFiles.LABELS}, f.${colsFiles.URL}))`)
            .from(tableFiles.NAME, 'f')
            .where(`cf.${colsCarsFiles.CAR_ID} = '${id}'`)
            .left_join(tableCarsFiles.NAME, 'cf', `cf.${colsCarsFiles.FILE_ID} = f.id`)
            .toString()
    })`, HOMELESS_COLUMNS.FILES)
    .from(table.NAME, 'c')
    .where(`c.id = '${id}'`)
    .where(`c.${cols.DELETED} = 'f'`)
    .left_join(tableVehicleTypes.NAME, 'vt', `vt.id = c.${cols.CAR_VEHICLE_TYPE_ID}`)
    .left_join(tableDangerClasses.NAME, 'dc', `dc.id = c.${cols.CAR_DANGER_CLASS_ID}`)
    .toString();

const selectRecordByIdAndCompanyIdWithoutTrailer = (id, companyId) => squelPostgres
    .select()
    .from(table.NAME, 'c')
    .field('c.*')
    .where(`c.id = '${id}'`)
    .where(`c.${cols.COMPANY_ID} = '${companyId}'`)
    .where(`c.${cols.DELETED} = 'f'`)
    .where(`t.${colsTrailers.CAR_ID} IS NULL`)
    .left_join(tableTrailers.NAME, 't', `t.${colsTrailers.CAR_ID} = c.id`)
    .toString();

module.exports = {
    insertRecord,
    updateRecord,
    selectRecordById,
    selectCarsByCompanyIdPaginationSorting,
    selectCountCarsByCompanyId,
    selectRecordByStateNumberAndActive,
    selectRecordByIdAndCompanyIdLight,
    selectRecordByIdFull,
    selectRecordByIdAndCompanyIdWithoutTrailer,
};
