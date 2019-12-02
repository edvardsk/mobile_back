const squel = require('squel');
const { get } = require('lodash');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { SqlArray } = require('constants/instances');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.TRAILERS;
const tableTrailersStateNumbers = SQL_TABLES.TRAILERS_STATE_NUMBERS;
const tableFiles = SQL_TABLES.FILES;
const tableTrailersFiles = SQL_TABLES.TRAILERS_TO_FILES;
const tableVehicleTypes = SQL_TABLES.VEHICLE_TYPES;
const tableDangerClasses = SQL_TABLES.DANGER_CLASSES;

const cols = table.COLUMNS;
const colsTrailersStateNumbers = tableTrailersStateNumbers.COLUMNS;
const colsFiles = tableFiles.COLUMNS;
const colsTrailersFiles = tableTrailersFiles.COLUMNS;
const colsVehicleTypes = tableVehicleTypes.COLUMNS;
const colsDangerClasses = tableDangerClasses.COLUMNS;

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

const selectTrailersByCompanyIdPaginationSorting = (companyId, limit, offset, sortColumn, asc, filter) => {
    let expression = squelPostgres
        .select()
        .field('t.*')
        .field(`tsn.${colsTrailersStateNumbers.NUMBER}`, HOMELESS_COLUMNS.TRAILER_STATE_NUMBER)
        .field(`vt.${colsVehicleTypes.NAME}`, HOMELESS_COLUMNS.VEHICLE_TYPE_NAME)
        .field(`dc.${colsDangerClasses.NAME}`, HOMELESS_COLUMNS.DANGER_CLASS_NAME)
        .from(table.NAME, 't')
        .where(`t.${cols.COMPANY_ID} = '${companyId}'`)
        .where(`t.${cols.DELETED} = 'f'`)
        .where(`tsn.${colsTrailersStateNumbers.IS_ACTIVE} = 't'`);

    expression = setTrailersFilter(expression, filter);
    return expression
        .left_join(tableTrailersStateNumbers.NAME, 'tsn', `tsn.${colsTrailersStateNumbers.TRAILER_ID} = t.id`)
        .left_join(tableVehicleTypes.NAME, 'vt', `vt.id = t.${cols.TRAILER_VEHICLE_TYPE_ID}`)
        .left_join(tableDangerClasses.NAME, 'dc', `dc.id = t.${cols.TRAILER_DANGER_CLASS_ID}`)
        .order(sortColumn, asc)
        .limit(limit)
        .offset(offset)
        .toString();
};

const selectCountTrailersByCompanyId = (companyId, filter) => {
    let expression = squelPostgres
        .select()
        .field('COUNT(t.id)')
        .from(table.NAME, 't')
        .where(`t.${cols.COMPANY_ID} = '${companyId}'`)
        .where(`t.${cols.DELETED} = 'f'`)
        .where(`tsn.${colsTrailersStateNumbers.IS_ACTIVE} = 't'`);

    expression = setTrailersFilter(expression, filter);
    return expression
        .left_join(tableTrailersStateNumbers.NAME, 'tsn', `tsn.${colsTrailersStateNumbers.TRAILER_ID} = t.id`)
        .toString();
};

const setTrailersFilter = (expression, filteringObject) => {
    const paramForCarId = filteringObject[HOMELESS_COLUMNS.LINKED] ? 'NOT' : '';
    const filteringObjectSQLExpressions = [
        [HOMELESS_COLUMNS.QUERY, `
            t.${cols.TRAILER_MARK}::text ILIKE '%${filteringObject[HOMELESS_COLUMNS.QUERY]}%'
            OR
            t.${cols.TRAILER_MODEL}::text ILIKE '%${filteringObject[HOMELESS_COLUMNS.QUERY]}%'
            OR
            t.${cols.TRAILER_MADE_YEAR_AT}::text ILIKE '%${filteringObject[HOMELESS_COLUMNS.QUERY]}%'
            OR
            tsn.${colsTrailersStateNumbers.NUMBER}::text ILIKE '%${filteringObject[HOMELESS_COLUMNS.QUERY]}%'
        `],
        [HOMELESS_COLUMNS.LINKED, `t.${cols.CAR_ID} IS ${paramForCarId} NULL`],
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
    .from(table.NAME, 't')
    .field('t.*')
    .where(`tsn.${colsTrailersStateNumbers.NUMBER} = '${stateNumber}'`)
    .where(`tsn.${colsTrailersStateNumbers.IS_ACTIVE} = 't'`)
    .left_join(tableTrailersStateNumbers.NAME, 'tsn', `tsn.${colsTrailersStateNumbers.TRAILER_ID} = t.id`)
    .toString();

const selectRecordByIdFull = id => squelPostgres
    .select()
    .field('t.*')
    .field(`vt.${colsVehicleTypes.NAME}`, HOMELESS_COLUMNS.VEHICLE_TYPE_NAME)
    .field(`dc.${colsDangerClasses.NAME}`, HOMELESS_COLUMNS.DANGER_CLASS_NAME)
    .field(`ARRAY(${
        squelPostgres
            .select()
            .field(`row_to_json(row(f.id, f.${colsFiles.NAME}, f.${colsFiles.LABELS}, f.${colsFiles.URL}))`)
            .from(tableFiles.NAME, 'f')
            .where(`tf.${colsTrailersFiles.TRAILER_ID} = '${id}'`)
            .left_join(tableTrailersFiles.NAME, 'tf', `tf.${colsTrailersFiles.FILE_ID} = f.id`)
            .toString()
    })`, HOMELESS_COLUMNS.FILES)
    .from(table.NAME, 't')
    .where(`t.id = '${id}'`)
    .where(`t.${cols.DELETED} = 'f'`)
    .left_join(tableVehicleTypes.NAME, 'vt', `vt.id = t.${cols.TRAILER_VEHICLE_TYPE_ID}`)
    .left_join(tableDangerClasses.NAME, 'dc', `dc.id = t.${cols.TRAILER_DANGER_CLASS_ID}`)
    .toString();

const selectRecordByIdAndCompanyIdLight = (id, companyId) => squelPostgres
    .select()
    .field('id')
    .field(cols.CAR_ID)
    .from(table.NAME)
    .where(`id = '${id}'`)
    .where(`${cols.COMPANY_ID} = '${companyId}'`)
    .where(`${cols.DELETED} = 'f'`)
    .toString();

module.exports = {
    insertRecord,
    updateRecord,
    selectRecordById,
    selectTrailersByCompanyIdPaginationSorting,
    selectCountTrailersByCompanyId,
    selectRecordByStateNumberAndActive,
    selectRecordByIdFull,
    selectRecordByIdAndCompanyIdLight,
};
