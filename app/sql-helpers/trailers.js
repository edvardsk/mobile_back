const squel = require('squel');
const { get } = require('lodash');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { SqlArray } = require('constants/instances');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.TRAILERS;
const tableCars = SQL_TABLES.CARS;
const tableTrailersStateNumbers = SQL_TABLES.TRAILERS_STATE_NUMBERS;
const tableCarsStateNumbers = SQL_TABLES.CARS_STATE_NUMBERS;
const tableFiles = SQL_TABLES.FILES;
const tableTrailersFiles = SQL_TABLES.TRAILERS_TO_FILES;
const tableVehicleTypes = SQL_TABLES.VEHICLE_TYPES;
const tableDangerClasses = SQL_TABLES.DANGER_CLASSES;

const cols = table.COLUMNS;
const colsCars = tableCars.COLUMNS;
const colsTrailersStateNumbers = tableTrailersStateNumbers.COLUMNS;
const colsCarsStateNumbers = tableCarsStateNumbers.COLUMNS;
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

const updateRecordByCarId = (carId, data) => squelPostgres
    .update()
    .table(table.NAME)
    .setFields(data)
    .where(`${cols.CAR_ID} = '${carId}'`)
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
    .field(`tsn.${colsTrailersStateNumbers.NUMBER}`, HOMELESS_COLUMNS.TRAILER_STATE_NUMBER)
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
    .where(`tsn.${colsTrailersStateNumbers.IS_ACTIVE} = 't'`)
    .where(`t.id = '${id}'`)
    .where(`t.${cols.DELETED} = 'f'`)
    .left_join(tableVehicleTypes.NAME, 'vt', `vt.id = t.${cols.TRAILER_VEHICLE_TYPE_ID}`)
    .left_join(tableDangerClasses.NAME, 'dc', `dc.id = t.${cols.TRAILER_DANGER_CLASS_ID}`)
    .left_join(tableTrailersStateNumbers.NAME, 'tsn', `tsn.${colsTrailersStateNumbers.TRAILER_ID} = t.id`)
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

const selectAvailableTrailersByCompanyIdPaginationSorting = (companyId, limit, offset, sortColumn, asc, filter) => {
    let expression = squelPostgres
        .select()
        .field('t.*')
        .field(`tsn.${colsTrailersStateNumbers.NUMBER}`, HOMELESS_COLUMNS.TRAILER_STATE_NUMBER)
        .field(`csn.${colsCarsStateNumbers.NUMBER}`, HOMELESS_COLUMNS.CAR_STATE_NUMBER)
        .field(`tvt.${colsVehicleTypes.NAME}`, HOMELESS_COLUMNS.TRAILER_VEHICLE_TYPE_NAME)
        .field(`tdc.${colsDangerClasses.NAME}`, HOMELESS_COLUMNS.TRAILER_DANGER_CLASS_NAME)
        .field(`cvt.${colsVehicleTypes.NAME}`, HOMELESS_COLUMNS.CAR_VEHICLE_TYPE_NAME)
        .field(`cdc.${colsDangerClasses.NAME}`, HOMELESS_COLUMNS.CAR_DANGER_CLASS_NAME)
        .field('c.id', HOMELESS_COLUMNS.CAR_ID)
        .field(`c.${colsCars.CAR_MARK}`, colsCars.CAR_MARK)
        .field(`c.${colsCars.CAR_MODEL}`, colsCars.CAR_MODEL)
        .field(`c.${colsCars.CAR_WIDTH}`, colsCars.CAR_WIDTH)
        .field(`c.${colsCars.CAR_HEIGHT}`, colsCars.CAR_HEIGHT)
        .field(`c.${colsCars.CAR_LENGTH}`, colsCars.CAR_LENGTH)
        .field(`c.${colsCars.CAR_CARRYING_CAPACITY}`, colsCars.CAR_CARRYING_CAPACITY)
        .field(`c.${colsCars.CAR_TYPE}`, colsCars.CAR_TYPE)
        .from(table.NAME, 't')
        .where(`t.${cols.COMPANY_ID} = '${companyId}'`)
        .where(`t.${cols.DELETED} = 'f'`)
        .where(`tsn.${colsTrailersStateNumbers.IS_ACTIVE} = 't'`)
        .where(`csn.${colsCarsStateNumbers.IS_ACTIVE} = 't' OR csn.${colsCarsStateNumbers.IS_ACTIVE} IS NULL`);

    expression = setAvailableTrailersFilter(expression, filter);
    return expression
        .left_join(tableTrailersStateNumbers.NAME, 'tsn', `tsn.${colsTrailersStateNumbers.TRAILER_ID} = t.id`)
        .left_join(tableVehicleTypes.NAME, 'tvt', `tvt.id = t.${cols.TRAILER_VEHICLE_TYPE_ID}`)
        .left_join(tableDangerClasses.NAME, 'tdc', `tdc.id = t.${cols.TRAILER_DANGER_CLASS_ID}`)
        .left_join(tableCars.NAME, 'c', `c.id = t.${cols.CAR_ID}`)
        .left_join(tableCarsStateNumbers.NAME, 'csn', `csn.${colsCarsStateNumbers.CAR_ID} = c.id`)
        .left_join(tableDangerClasses.NAME, 'cdc', `cdc.id = c.${colsCars.CAR_DANGER_CLASS_ID}`)
        .left_join(tableVehicleTypes.NAME, 'cvt', `cvt.id = c.${colsCars.CAR_VEHICLE_TYPE_ID}`)
        .order(sortColumn, asc)
        .limit(limit)
        .offset(offset)
        .toString();
};

const selectAvailableCountTrailersByCompanyId = (companyId, filter) => {
    let expression = squelPostgres
        .select()
        .field('COUNT(t.id)')
        .from(table.NAME, 't')
        .where(`t.${cols.CAR_ID} IS NULL`)
        .where(`t.${cols.COMPANY_ID} = '${companyId}'`)
        .where(`t.${cols.DELETED} = 'f'`)
        .where(`tsn.${colsTrailersStateNumbers.IS_ACTIVE} = 't'`);

    expression = setAvailableTrailersFilter(expression, filter);
    return expression
        .left_join(tableTrailersStateNumbers.NAME, 'tsn', `tsn.${colsTrailersStateNumbers.TRAILER_ID} = t.id`)
        .toString();
};

const setAvailableTrailersFilter = (expression, filteringObject) => {
    const filteringObjectSQLExpressions = [
        [HOMELESS_COLUMNS.TRAILER_STATE_NUMBER, `tsn.${colsTrailersStateNumbers.NUMBER}::text ILIKE '%${filteringObject[HOMELESS_COLUMNS.TRAILER_STATE_NUMBER]}%'`],
    ];

    for (let [key, exp] of filteringObjectSQLExpressions) {
        if (get(filteringObject, key) !== undefined) {
            expression = expression.where(exp);
        }
    }
    return expression;
};

const selectAvailableTrailersByIdsAndCompanyId = (ids, companyId) => squelPostgres // todo: check full availability
    .select()
    .from(table.NAME, 't')
    .field('t.*')
    .field('c.id', HOMELESS_COLUMNS.CAR_ID)
    .where('t.id IN ?', ids)
    .where(`t.${cols.COMPANY_ID} = '${companyId}'`)
    .where(`t.${cols.DELETED} = 'f'`)
    .left_join(tableCars.NAME, 'c', `c.id = t.${cols.CAR_ID}`)
    .toString();

const selectAvailableTrailerByIdAndCompanyId = (id, companyId) => squelPostgres // todo: check full availability
    .select()
    .from(table.NAME, 't')
    .field('t.*')
    .field('c.id', HOMELESS_COLUMNS.CAR_ID)
    .where(`t.id = '${id}'`)
    .where(`t.${cols.COMPANY_ID} = '${companyId}'`)
    .where(`t.${cols.DELETED} = 'f'`)
    .left_join(tableCars.NAME, 'c', `c.id = t.${cols.CAR_ID}`)
    .toString();

const selectRecordsByStateNumbers = numbers => squelPostgres
    .select()
    .from(table.NAME, 't')
    .field('t.*')
    .field(`tsn.${colsTrailersStateNumbers.NUMBER}`, HOMELESS_COLUMNS.TRAILER_STATE_NUMBER)
    .where(`tsn.${colsTrailersStateNumbers.IS_ACTIVE} = 't'`)
    .where(`tsn.${colsTrailersStateNumbers.NUMBER} IN ?`, numbers)
    .left_join(tableTrailersStateNumbers.NAME, 'tsn', `tsn.${colsTrailersStateNumbers.TRAILER_ID} = t.id`)
    .toString();

module.exports = {
    insertRecord,
    insertRecords,
    updateRecord,
    updateRecordByCarId,
    selectRecordById,
    selectTrailersByCompanyIdPaginationSorting,
    selectCountTrailersByCompanyId,
    selectRecordByStateNumberAndActive,
    selectRecordByIdFull,
    selectRecordByIdAndCompanyIdLight,
    selectAvailableTrailersByCompanyIdPaginationSorting,
    selectAvailableCountTrailersByCompanyId,
    selectAvailableTrailersByIdsAndCompanyId,
    selectAvailableTrailerByIdAndCompanyId,
    selectRecordsByStateNumbers,
};
