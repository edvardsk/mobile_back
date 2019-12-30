const squel = require('squel');
const { get } = require('lodash');
const { CAR_TYPES_MAP } = require('constants/cars');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { SqlArray } = require('constants/instances');
const { FINISHED_STATUSES_LIST, DEAL_STATUSES_MAP } = require('constants/deal-statuses');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.CARS;
const tableCarsStateNumbers = SQL_TABLES.CARS_STATE_NUMBERS;
const tableFiles = SQL_TABLES.FILES;
const tableCarsFiles = SQL_TABLES.CARS_TO_FILES;
const tableVehicleTypes = SQL_TABLES.VEHICLE_TYPES;
const tableDangerClasses = SQL_TABLES.DANGER_CLASSES;
const tableTrailers = SQL_TABLES.TRAILERS;
const tableTrailersNumbers = SQL_TABLES.TRAILERS_STATE_NUMBERS;
const tableDeals = SQL_TABLES.DEALS;
const tableDealsStatuses = SQL_TABLES.DEAL_STATUSES;
const tableDealsStatusesHistory = SQL_TABLES.DEAL_HISTORY_STATUSES;
const tableCargos = SQL_TABLES.CARGOS;
const tableDraftCars = SQL_TABLES.DRAFT_CARS;
const tableDraftCarsFiles = SQL_TABLES.DRAFT_CARS_TO_FILES;
const tableDraftFiles = SQL_TABLES.DRAFT_FILES;
const tableDraftTrailers = SQL_TABLES.DRAFT_TRAILERS;
const tableCarLatestPoints = SQL_TABLES.CAR_LATEST_POINTS;

const cols = table.COLUMNS;
const colsCarsStateNumbers = tableCarsStateNumbers.COLUMNS;
const colsFiles = tableFiles.COLUMNS;
const colsCarsFiles = tableCarsFiles.COLUMNS;
const colsVehicleTypes = tableVehicleTypes.COLUMNS;
const colsDangerClasses = tableDangerClasses.COLUMNS;
const colsTrailers = tableTrailers.COLUMNS;
const colsTrailersNumbers = tableTrailersNumbers.COLUMNS;
const colsDeals = tableDeals.COLUMNS;
const colsDealsStatuses = tableDealsStatuses.COLUMNS;
const colsDealsStatusesHistory = tableDealsStatusesHistory.COLUMNS;
const colsCargos = tableCargos.COLUMNS;
const colsDraftCars = tableDraftCars.COLUMNS;
const colsDraftCarsFiles = tableDraftCarsFiles.COLUMNS;
const colsDraftFiles = tableDraftFiles.COLUMNS;
const colsDraftTrailers = tableDraftTrailers.COLUMNS;
const colsCarLatestPoints = tableCarLatestPoints.COLUMNS;

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

const selectRecordById = id => squelPostgres
    .select()
    .from(table.NAME, 'c')
    .field('c.*')
    .field(`csn.${colsCarsStateNumbers.NUMBER}`, HOMELESS_COLUMNS.CAR_STATE_NUMBER)
    .where(`c.id = '${id}'`)
    .where(`c.${cols.DELETED} = 'f'`)
    .where(`csn.${colsCarsStateNumbers.IS_ACTIVE} = 't'`)
    .left_join(tableCarsStateNumbers.NAME, 'csn', `csn.${colsCarsStateNumbers.CAR_ID} = c.id`)
    .limit(1)
    .toString();

const selectRecordWithActiveDealsById = id => squelPostgres
    .select()
    .field('c.*')
    .field(`ARRAY(${
        squelPostgres
            .select()
            .field('de.id')
            .from(tableDeals.NAME, 'de')
            .where(`de.${colsDeals.CAR_ID} = c.id`)
            .where(`ds.${colsDealsStatuses.NAME} NOT IN ?`, [DEAL_STATUSES_MAP.FAILED])
            .left_join(tableDealsStatusesHistory.NAME, 'dsh', `dsh.${colsDealsStatusesHistory.DEAL_ID} = de.id`)
            .left_join(tableDealsStatuses.NAME, 'ds', `ds.id = dsh.${colsDealsStatusesHistory.DEAL_STATUS_ID}`)
            .toString()
    })`, HOMELESS_COLUMNS.DEALS)
    .from(table.NAME, 'c')
    .where(`c.id = '${id}'`)
    .where(`c.${cols.DELETED} = 'f'`)
    .limit(1)
    .toString();

const selectRecordByIdWithDeleted = id => squelPostgres
    .select()
    .from(table.NAME)
    .where(`id = '${id}'`)
    .toString();

const selectCarsByCompanyIdPaginationSorting = (companyId, limit, offset, sortColumn, asc, filter) => {
    let expression = squelPostgres
        .select()
        .field('c.*')

        .field('t.id', HOMELESS_COLUMNS.TRAILER_ID)
        .field(`t.${colsTrailers.TRAILER_MARK}`, colsTrailers.TRAILER_MARK)
        .field(`t.${colsTrailers.TRAILER_MODEL}`, colsTrailers.TRAILER_MODEL)
        .field(`t.${colsTrailers.TRAILER_WIDTH}`, colsTrailers.TRAILER_WIDTH)
        .field(`t.${colsTrailers.TRAILER_HEIGHT}`, colsTrailers.TRAILER_HEIGHT)
        .field(`t.${colsTrailers.TRAILER_LENGTH}`, colsTrailers.TRAILER_LENGTH)
        .field(`t.${colsTrailers.TRAILER_CARRYING_CAPACITY}`, colsTrailers.TRAILER_CARRYING_CAPACITY)
        .field(`t.${colsTrailers.VERIFIED}`, HOMELESS_COLUMNS.TRAILER_VERIFIED)
        .field(`t.${colsTrailers.SHADOW}`, HOMELESS_COLUMNS.TRAILER_SHADOW)

        .field(`dc.${colsDangerClasses.NAME}`, HOMELESS_COLUMNS.TRAILER_DANGER_CLASS_NAME)
        .field(`vt.${colsVehicleTypes.NAME}`, HOMELESS_COLUMNS.TRAILER_VEHICLE_TYPE_NAME)
        .field(`tsn.${colsTrailersNumbers.NUMBER}`, HOMELESS_COLUMNS.TRAILER_STATE_NUMBER)
        .field(`csn.${colsTrailersNumbers.NUMBER}`, HOMELESS_COLUMNS.CAR_STATE_NUMBER)

        .field(`drc.${colsDraftCars.CAR_MARK}`, HOMELESS_COLUMNS.DRAFT_CAR_MARK)
        .field(`drc.${colsDraftCars.CAR_MODEL}`, HOMELESS_COLUMNS.DRAFT_CAR_MODEL)
        .field(`drc.${colsDraftCars.CAR_VIN}`, HOMELESS_COLUMNS.DRAFT_CAR_VIN)
        .field(`drc.${colsDraftCars.CAR_STATE_NUMBER}`, HOMELESS_COLUMNS.DRAFT_CAR_STATE_NUMBER)
        .field(`drc.${colsDraftCars.CAR_MADE_YEAR_AT}`, HOMELESS_COLUMNS.DRAFT_CAR_MADE_YEAR_AT)
        .field(`drc.${colsDraftCars.CAR_TYPE}`, HOMELESS_COLUMNS.DRAFT_CAR_TYPE)

        .field(`dt.${colsDraftTrailers.TRAILER_MARK}`, HOMELESS_COLUMNS.DRAFT_TRAILER_MARK)
        .field(`dt.${colsDraftTrailers.TRAILER_MODEL}`, HOMELESS_COLUMNS.DRAFT_TRAILER_MODEL)
        .field(`dt.${colsDraftTrailers.TRAILER_WIDTH}`, HOMELESS_COLUMNS.DRAFT_TRAILER_WIDTH)
        .field(`dt.${colsDraftTrailers.TRAILER_HEIGHT}`, HOMELESS_COLUMNS.DRAFT_TRAILER_HEIGHT)
        .field(`dt.${colsDraftTrailers.TRAILER_LENGTH}`, HOMELESS_COLUMNS.DRAFT_TRAILER_LENGTH)
        .field(`dt.${colsDraftTrailers.TRAILER_CARRYING_CAPACITY}`, HOMELESS_COLUMNS.DRAFT_TRAILER_CARRYING_CAPACITY)
        .field(`ddc.${colsDangerClasses.NAME}`, HOMELESS_COLUMNS.DRAFT_TRAILER_DANGER_CLASS_NAME)
        .field(`dvt.${colsVehicleTypes.NAME}`, HOMELESS_COLUMNS.DRAFT_TRAILER_VEHICLE_TYPE_NAME)

        .from(table.NAME, 'c')
        .where(`c.${cols.COMPANY_ID} = '${companyId}'`)
        .where(`c.${cols.DELETED} = 'f'`)
        .where(`csn.${colsCarsStateNumbers.IS_ACTIVE} = 't'`)
        .where(`tsn.${colsTrailersNumbers.IS_ACTIVE} = 't' OR tsn.${colsTrailersNumbers.IS_ACTIVE} IS NULL`);

    expression = setCarsFilter(expression, filter);
    return expression
        .left_join(tableCarsStateNumbers.NAME, 'csn', `csn.${colsCarsStateNumbers.CAR_ID} = c.id`)
        .left_join(tableTrailers.NAME, 't', `t.${colsTrailers.CAR_ID} = c.id`)
        .left_join(tableDangerClasses.NAME, 'dc', `dc.id = t.${colsTrailers.TRAILER_DANGER_CLASS_ID}`)
        .left_join(tableVehicleTypes.NAME, 'vt', `vt.id = t.${colsTrailers.TRAILER_VEHICLE_TYPE_ID}`)
        .left_join(tableTrailersNumbers.NAME, 'tsn', `tsn.${colsTrailersNumbers.TRAILER_ID} = t.id`)
        .left_join(tableDraftCars.NAME, 'drc', `drc.${colsDraftCars.CAR_ID} = c.id`)
        .left_join(tableDraftTrailers.NAME, 'dt', `dt.${colsDraftTrailers.TRAILER_ID} = t.id`)
        .left_join(tableDangerClasses.NAME, 'ddc', `ddc.id = dt.${colsDraftTrailers.TRAILER_DANGER_CLASS_ID}`)
        .left_join(tableVehicleTypes.NAME, 'dvt', `dvt.id = dt.${colsDraftTrailers.TRAILER_VEHICLE_TYPE_ID}`)
        .order(sortColumn, asc)
        .limit(limit)
        .offset(offset)
        .toString();
};

const selectRecordsForSearch = ({ upGeo }, companyId, showMyCars, searchRadius, filteringObject) => {
    let expression = squelPostgres
        .select()
        .field('c.*')
        .field(`cvt.${colsVehicleTypes.NAME}`, HOMELESS_COLUMNS.CAR_VEHICLE_TYPE_NAME)
        .field(`cdc.${colsDangerClasses.NAME}`, HOMELESS_COLUMNS.CAR_DANGER_CLASS_NAME)
        .field('t.id', HOMELESS_COLUMNS.TRAILER_ID)
        .field(`t.${colsTrailers.TRAILER_MARK}`, colsTrailers.TRAILER_MARK)
        .field(`t.${colsTrailers.TRAILER_MODEL}`, colsTrailers.TRAILER_MODEL)
        .field(`t.${colsTrailers.TRAILER_WIDTH}`, colsTrailers.TRAILER_WIDTH)
        .field(`t.${colsTrailers.TRAILER_HEIGHT}`, colsTrailers.TRAILER_HEIGHT)
        .field(`t.${colsTrailers.TRAILER_LENGTH}`, colsTrailers.TRAILER_LENGTH)
        .field(`t.${colsTrailers.TRAILER_CARRYING_CAPACITY}`, colsTrailers.TRAILER_CARRYING_CAPACITY)
        .field(`t.${colsTrailers.TRAILER_VEHICLE_TYPE_ID}`, colsTrailers.TRAILER_VEHICLE_TYPE_ID)
        .field(`tvt.${colsVehicleTypes.NAME}`, HOMELESS_COLUMNS.TRAILER_VEHICLE_TYPE_NAME)
        .field(`tdc.${colsDangerClasses.NAME}`, HOMELESS_COLUMNS.TRAILER_DANGER_CLASS_NAME)
        .field(`t.${colsTrailers.VERIFIED}`, HOMELESS_COLUMNS.TRAILER_VERIFIED)
        .field(`tsn.${colsTrailersNumbers.NUMBER}`, HOMELESS_COLUMNS.TRAILER_STATE_NUMBER)
        .field(`csn.${colsCarsStateNumbers.NUMBER}`, HOMELESS_COLUMNS.CAR_STATE_NUMBER)
        .field(`ARRAY(${
            squelPostgres
                .select()
                .field(`row_to_json(row(
                  d.id, ds.${colsDealsStatuses.NAME}, crg.${colsCargos.UPLOADING_DATE_FROM}, crg.${colsCargos.DOWNLOADING_DATE_TO}
                ))`)
                .from(tableDeals.NAME, 'd')
                .where(`d.${colsDeals.CAR_ID} = c.id`)
                .where('dsh.id IS NULL OR dsh.id = ?', squelPostgres
                    .select()
                    .field('hdsh.id')
                    .from(tableDealsStatusesHistory.NAME, 'hdsh')
                    .where(`hdsh.${colsDealsStatusesHistory.DEAL_ID} = d.id`)
                    .order(colsDealsStatusesHistory.CREATED_AT, false)
                    .limit(1)
                )
                .left_join(tableCargos.NAME, 'crg', `crg.id = d.${colsDeals.CARGO_ID}`)
                .left_join(tableDealsStatusesHistory.NAME, 'dsh', `dsh.${colsDealsStatusesHistory.DEAL_ID} = d.id`)
                .left_join(tableDealsStatuses.NAME, 'ds', `ds.id = dsh.${colsDealsStatusesHistory.DEAL_STATUS_ID}`)
                .toString()
        })`, HOMELESS_COLUMNS.DEALS)
        .field(`ARRAY(${
            squelPostgres
                .select()
                .field(`ST_AsText(cp.${colsCarLatestPoints.COORDINATES})`)
                .from(tableCarLatestPoints.NAME, 'cp')
                .where(`cp.${colsCarLatestPoints.CAR_ID} = c.id`)
                .where(`ST_Distance(${upGeo}, cp.${colsCarLatestPoints.COORDINATES}) <= ${searchRadius * 1000}`)
                .toString()
        })`, HOMELESS_COLUMNS.COORDINATES)
        .from(table.NAME, 'c')
        .where(`csn.${colsCarsStateNumbers.IS_ACTIVE} = 't'`)
        .where(`tsn.${colsTrailersNumbers.IS_ACTIVE} = 't' OR c.${cols.CAR_TYPE} = '${CAR_TYPES_MAP.TRUCK}'`);

    if (companyId) {
        expression
            .where(`c.${cols.COMPANY_ID} ${showMyCars ? '=' : '<>'} '${companyId}'`);
    }

    setCarsWithTrailersSearchFilter(expression, filteringObject);

    return expression
        .left_join(tableCarsStateNumbers.NAME, 'csn', `csn.${colsCarsStateNumbers.CAR_ID} = c.id`)
        .left_join(tableDangerClasses.NAME, 'cdc', `cdc.id = c.${cols.CAR_DANGER_CLASS_ID}`)
        .left_join(tableVehicleTypes.NAME, 'cvt', `cvt.id = c.${cols.CAR_VEHICLE_TYPE_ID}`)
        .left_join(tableTrailers.NAME, 't', `t.${colsTrailers.CAR_ID} = c.id`)
        .left_join(tableTrailersNumbers.NAME, 'tsn', `tsn.${colsTrailersNumbers.TRAILER_ID} = t.id`)
        .left_join(tableVehicleTypes.NAME, 'tvt', `tvt.id = t.${colsTrailers.TRAILER_VEHICLE_TYPE_ID}`)
        .left_join(tableDangerClasses.NAME, 'tdc', `tdc.id = t.${colsTrailers.TRAILER_DANGER_CLASS_ID}`)
        .toString();
};

const setCarsWithTrailersSearchFilter = (expression, filteringObject) => {
    let carExp = '';
    const filteringObjectCarSQLExpressions = [
        [colsCargos.GROSS_WEIGHT, `c.${cols.CAR_CARRYING_CAPACITY} >= ${filteringObject[colsCargos.GROSS_WEIGHT]}`],
        [colsCargos.WIDTH, `c.${cols.CAR_WIDTH} >= ${filteringObject[colsCargos.WIDTH]}`],
        [colsCargos.HEIGHT, `c.${cols.CAR_HEIGHT} >= ${filteringObject[colsCargos.HEIGHT]}`],
        [colsCargos.LENGTH, `c.${cols.CAR_LENGTH} >= ${filteringObject[colsCargos.LENGTH]}`],
        [colsCargos.VEHICLE_TYPE_ID, `c.${cols.CAR_VEHICLE_TYPE_ID} = '${filteringObject[colsCargos.VEHICLE_TYPE_ID]}'`],
        [colsCargos.DANGER_CLASS_ID, `c.${cols.CAR_DANGER_CLASS_ID} = '${filteringObject[colsCargos.DANGER_CLASS_ID]}'`],
        [colsCargos.LOADING_METHODS, `c.${cols.CAR_LOADING_METHODS} @> '{${filteringObject[colsCargos.LOADING_METHODS]}}'`],
    ];

    for (let [key, exp] of filteringObjectCarSQLExpressions) {
        if (get(filteringObject, key) !== undefined) {
            if (carExp.length > 0) {
                carExp += ' AND ';
            }
            carExp += exp;
        }
    }

    let trailerExp = '';
    const filteringObjectTrailerSQLExpressions = [
        [colsCargos.GROSS_WEIGHT, `t.${colsTrailers.TRAILER_CARRYING_CAPACITY} >= ${filteringObject[colsCargos.GROSS_WEIGHT]}`],
        [colsCargos.WIDTH, `t.${colsTrailers.TRAILER_WIDTH} >= ${filteringObject[colsCargos.WIDTH]}`],
        [colsCargos.HEIGHT, `t.${colsTrailers.TRAILER_HEIGHT} >= ${filteringObject[colsCargos.HEIGHT]}`],
        [colsCargos.LENGTH, `t.${colsTrailers.TRAILER_LENGTH} >= ${filteringObject[colsCargos.LENGTH]}`],
        [colsCargos.VEHICLE_TYPE_ID, `t.${colsTrailers.TRAILER_VEHICLE_TYPE_ID} = '${filteringObject[colsCargos.VEHICLE_TYPE_ID]}'`],
        [colsCargos.DANGER_CLASS_ID, `t.${colsTrailers.TRAILER_DANGER_CLASS_ID} = '${filteringObject[colsCargos.DANGER_CLASS_ID]}'`],
        [colsCargos.LOADING_METHODS, `t.${colsTrailers.TRAILER_LOADING_METHODS} @> '{${filteringObject[colsCargos.LOADING_METHODS]}}'`],
    ];

    for (let [key, exp] of filteringObjectTrailerSQLExpressions) {
        if (get(filteringObject, key) !== undefined) {
            if (trailerExp.length > 0) {
                trailerExp += ' AND ';
            }
            trailerExp += exp;
        }
    }

    const resultExpression = `${carExp}${carExp && trailerExp ? ' OR ' : ''}${trailerExp}`;

    expression = expression.where(resultExpression);

    return expression;
};

const selectAllNewRecordsForSearch = (companyId, showMyCars) => {
    let expression = squelPostgres
        .select()
        .field('c.*')
        .field(`cvt.${colsVehicleTypes.NAME}`, HOMELESS_COLUMNS.CAR_VEHICLE_TYPE_NAME)
        .field('t.id', HOMELESS_COLUMNS.TRAILER_ID)
        .field(`t.${colsTrailers.VERIFIED}`, HOMELESS_COLUMNS.TRAILER_VERIFIED)
        .field(`tsn.${colsTrailersNumbers.NUMBER}`, HOMELESS_COLUMNS.TRAILER_STATE_NUMBER)
        .field(`csn.${colsCarsStateNumbers.NUMBER}`, HOMELESS_COLUMNS.CAR_STATE_NUMBER)
        .field(`ARRAY(${
            squelPostgres
                .select()
                .field(`row_to_json(row(
                  d.id, ds.${colsDealsStatuses.NAME}, crg.${colsCargos.UPLOADING_DATE_FROM}, crg.${colsCargos.UPLOADING_DATE_TO}, crg.${colsCargos.DOWNLOADING_DATE_FROM}, crg.${colsCargos.DOWNLOADING_DATE_TO}
                ))`)
                .from(tableDeals.NAME, 'd')
                .where(`d.${colsDeals.CAR_ID} = c.id`)
                .where('dsh.id IS NULL OR dsh.id = ?', squelPostgres
                    .select()
                    .field('hdsh.id')
                    .from(tableDealsStatusesHistory.NAME, 'hdsh')
                    .where(`hdsh.${colsDealsStatusesHistory.DEAL_ID} = d.id`)
                    .order(colsDealsStatusesHistory.CREATED_AT, false)
                    .limit(1)
                )
                .left_join(tableCargos.NAME, 'crg', `crg.id = d.${colsDeals.CARGO_ID}`)
                .left_join(tableDealsStatusesHistory.NAME, 'dsh', `dsh.${colsDealsStatusesHistory.DEAL_ID} = d.id`)
                .left_join(tableDealsStatuses.NAME, 'ds', `ds.id = dsh.${colsDealsStatusesHistory.DEAL_STATUS_ID}`)
                .toString()
        })`, HOMELESS_COLUMNS.DEALS)
        .field(`ARRAY(${
            squelPostgres
                .select()
                .field(`ST_AsText(cp.${colsCarLatestPoints.COORDINATES})`)
                .from(tableCarLatestPoints.NAME, 'cp')
                .where(`cp.${colsCarLatestPoints.CAR_ID} = c.id`)
                .toString()
        })`, HOMELESS_COLUMNS.COORDINATES)
        .from(table.NAME, 'c')
        .where(`csn.${colsCarsStateNumbers.IS_ACTIVE} = 't'`)
        .where(`tsn.${colsTrailersNumbers.IS_ACTIVE} = 't' OR c.${cols.CAR_TYPE} = '${CAR_TYPES_MAP.TRUCK}'`);

    if (companyId) {
        expression
            .where(`c.${cols.COMPANY_ID} ${showMyCars ? '=' : '<>'} '${companyId}'`);
    }

    return expression
        .left_join(tableCarsStateNumbers.NAME, 'csn', `csn.${colsCarsStateNumbers.CAR_ID} = c.id`)
        .left_join(tableTrailers.NAME, 't', `t.${colsTrailers.CAR_ID} = c.id`)
        .left_join(tableVehicleTypes.NAME, 'cvt', `cvt.id = c.${cols.CAR_VEHICLE_TYPE_ID}`)
        .left_join(tableTrailersNumbers.NAME, 'tsn', `tsn.${colsTrailersNumbers.TRAILER_ID} = t.id`)
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
    .field(`csn.${colsCarsStateNumbers.NUMBER}`, HOMELESS_COLUMNS.CAR_STATE_NUMBER)
    .field(`drc.${colsDraftCars.CAR_MARK}`, HOMELESS_COLUMNS.DRAFT_CAR_MARK)
    .field(`drc.${colsDraftCars.CAR_MODEL}`, HOMELESS_COLUMNS.DRAFT_CAR_MODEL)
    .field(`drc.${colsDraftCars.CAR_VIN}`, HOMELESS_COLUMNS.DRAFT_CAR_VIN)
    .field(`drc.${colsDraftCars.CAR_STATE_NUMBER}`, HOMELESS_COLUMNS.DRAFT_CAR_STATE_NUMBER)
    .field(`drc.${colsDraftCars.CAR_MADE_YEAR_AT}`, HOMELESS_COLUMNS.DRAFT_CAR_MADE_YEAR_AT)
    .field(`drc.${colsDraftCars.CAR_TYPE}`, HOMELESS_COLUMNS.DRAFT_CAR_TYPE)
    .field(`drc.${colsDraftCars.CAR_LOADING_METHODS}`, HOMELESS_COLUMNS.DRAFT_CAR_LOADING_METHODS)
    .field(`drc.${colsDraftCars.CAR_DANGER_CLASS_ID}`, HOMELESS_COLUMNS.DRAFT_CAR_DANGER_CLASS_ID)
    .field(`drc.${colsDraftCars.CAR_VEHICLE_TYPE_ID}`, HOMELESS_COLUMNS.DRAFT_CAR_VEHICLE_TYPE_ID)
    .field(`drc.${colsDraftCars.CAR_WIDTH}`, HOMELESS_COLUMNS.DRAFT_CAR_WIDTH)
    .field(`drc.${colsDraftCars.CAR_HEIGHT}`, HOMELESS_COLUMNS.DRAFT_CAR_HEIGHT)
    .field(`drc.${colsDraftCars.CAR_LENGTH}`, HOMELESS_COLUMNS.DRAFT_CAR_LENGTH)
    .field(`drc.${colsDraftCars.CAR_CARRYING_CAPACITY}`, HOMELESS_COLUMNS.DRAFT_CAR_CARRYING_CAPACITY)
    .field(`drc.${colsDraftCars.COMMENTS}`, colsDraftCars.COMMENTS)
    .field(`dvt.${colsVehicleTypes.NAME}`, HOMELESS_COLUMNS.DRAFT_VEHICLE_TYPE_NAME)
    .field(`ddc.${colsDangerClasses.NAME}`, HOMELESS_COLUMNS.DRAFT_DANGER_CLASS_NAME)
    .field(`ARRAY(${
        squelPostgres
            .select()
            .field(`row_to_json(row(f.id, f.${colsFiles.NAME}, f.${colsFiles.LABELS}, f.${colsFiles.URL}))`)
            .from(tableFiles.NAME, 'f')
            .where(`cf.${colsCarsFiles.CAR_ID} = '${id}'`)
            .left_join(tableCarsFiles.NAME, 'cf', `cf.${colsCarsFiles.FILE_ID} = f.id`)
            .toString()
    })`, HOMELESS_COLUMNS.FILES)
    .field(`ARRAY(${
        squelPostgres
            .select()
            .field(`row_to_json(row(df.id, df.${colsDraftFiles.NAME}, df.${colsDraftFiles.LABELS}, df.${colsDraftFiles.URL}))`)
            .from(tableDraftFiles.NAME, 'df')
            .where(`dc.${colsDraftCars.CAR_ID} = '${id}'`)
            .left_join(tableDraftCarsFiles.NAME, 'dcf', `dcf.${colsDraftCarsFiles.DRAFT_FILE_ID} = df.id`)
            .left_join(tableDraftCars.NAME, 'dc', `dc.id = dcf.${colsDraftCarsFiles.DRAFT_CAR_ID}`)
            .toString()
    })`, HOMELESS_COLUMNS.DRAFT_FILES)
    .from(table.NAME, 'c')
    .where(`c.id = '${id}'`)
    .where(`c.${cols.DELETED} = 'f'`)
    .where(`csn.${colsCarsStateNumbers.IS_ACTIVE} = 't'`)
    .left_join(tableVehicleTypes.NAME, 'vt', `vt.id = c.${cols.CAR_VEHICLE_TYPE_ID}`)
    .left_join(tableDangerClasses.NAME, 'dc', `dc.id = c.${cols.CAR_DANGER_CLASS_ID}`)
    .left_join(tableCarsStateNumbers.NAME, 'csn', `csn.${colsCarsStateNumbers.CAR_ID} = c.id`)
    .left_join(tableDraftCars.NAME, 'drc', `drc.${colsDraftCars.CAR_ID} = c.id`)
    .left_join(tableVehicleTypes.NAME, 'dvt', `dvt.id = drc.${colsDraftCars.CAR_VEHICLE_TYPE_ID}`)
    .left_join(tableDangerClasses.NAME, 'ddc', `ddc.id = drc.${colsDraftCars.CAR_DANGER_CLASS_ID}`)
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

const selectAvailableCarsByCompanyIdPaginationSorting = (companyId, cargoDates, limit, offset, sortColumn, asc, filter) => {
    let expression = squelPostgres
        .select()
        .field('c.*')
        .field(`cdc.${colsDangerClasses.NAME}`, HOMELESS_COLUMNS.CAR_DANGER_CLASS_NAME)
        .field(`cvt.${colsVehicleTypes.NAME}`, HOMELESS_COLUMNS.CAR_VEHICLE_TYPE_NAME)
        .field('t.id', HOMELESS_COLUMNS.TRAILER_ID)
        .field(`t.${colsTrailers.TRAILER_MARK}`, colsTrailers.TRAILER_MARK)
        .field(`t.${colsTrailers.TRAILER_MODEL}`, colsTrailers.TRAILER_MODEL)
        .field(`t.${colsTrailers.TRAILER_WIDTH}`, colsTrailers.TRAILER_WIDTH)
        .field(`t.${colsTrailers.TRAILER_HEIGHT}`, colsTrailers.TRAILER_HEIGHT)
        .field(`t.${colsTrailers.TRAILER_LENGTH}`, colsTrailers.TRAILER_LENGTH)
        .field(`t.${colsTrailers.TRAILER_CARRYING_CAPACITY}`, colsTrailers.TRAILER_CARRYING_CAPACITY)
        .field(`tdc.${colsDangerClasses.NAME}`, HOMELESS_COLUMNS.TRAILER_DANGER_CLASS_NAME)
        .field(`tvt.${colsVehicleTypes.NAME}`, HOMELESS_COLUMNS.TRAILER_VEHICLE_TYPE_NAME)
        .field(`tsn.${colsTrailersNumbers.NUMBER}`, HOMELESS_COLUMNS.TRAILER_STATE_NUMBER)
        .field(`csn.${colsCarsStateNumbers.NUMBER}`, HOMELESS_COLUMNS.CAR_STATE_NUMBER)
        .from(table.NAME, 'c')
        .where(`csn.${colsCarsStateNumbers.IS_ACTIVE} = 't'`)
        .where(`tsn.${colsTrailersNumbers.IS_ACTIVE} = 't' OR tsn.${colsTrailersNumbers.IS_ACTIVE} IS NULL`);

    setAvailableCarsForDealFilter(expression, cargoDates, companyId);

    expression = setDealAvailableCarsFilter(expression, filter);
    return expression
        .left_join(tableCarsStateNumbers.NAME, 'csn', `csn.${colsCarsStateNumbers.CAR_ID} = c.id`)
        .left_join(tableTrailers.NAME, 't', `t.${colsTrailers.CAR_ID} = c.id`)
        .left_join(tableDangerClasses.NAME, 'cdc', `cdc.id = c.${cols.CAR_DANGER_CLASS_ID}`)
        .left_join(tableVehicleTypes.NAME, 'cvt', `cvt.id = c.${cols.CAR_VEHICLE_TYPE_ID}`)
        .left_join(tableTrailersNumbers.NAME, 'tsn', `tsn.${colsTrailersNumbers.TRAILER_ID} = t.id`)
        .left_join(tableDangerClasses.NAME, 'tdc', `tdc.id = t.${colsTrailers.TRAILER_DANGER_CLASS_ID}`)
        .left_join(tableVehicleTypes.NAME, 'tvt', `tvt.id = t.${colsTrailers.TRAILER_VEHICLE_TYPE_ID}`)
        .order(sortColumn, asc)
        .limit(limit)
        .offset(offset)
        .toString();
};

const selectCountAvailableCarsByCompanyId = (companyId, cargoDates, filter) => {
    let expression = squelPostgres
        .select()
        .field('COUNT(c.id)')
        .from(table.NAME, 'c')
        .where(`csn.${colsCarsStateNumbers.IS_ACTIVE} = 't'`)
        .where(`tsn.${colsTrailersNumbers.IS_ACTIVE} = 't' OR tsn.${colsTrailersNumbers.IS_ACTIVE} IS NULL`);

    setAvailableCarsForDealFilter(expression, cargoDates, companyId);

    expression = setDealAvailableCarsFilter(expression, filter);
    return expression
        .left_join(tableCarsStateNumbers.NAME, 'csn', `csn.${colsCarsStateNumbers.CAR_ID} = c.id`)
        .left_join(tableTrailers.NAME, 't', `t.${colsTrailers.CAR_ID} = c.id`)
        .left_join(tableTrailersNumbers.NAME, 'tsn', `tsn.${colsTrailersNumbers.TRAILER_ID} = t.id`)
        .toString();
};

const setAvailableCarsForDealFilter = (expression, cargoDates, companyId, checkExternalCars = false) => {
    const {
        upFrom, upTo, downTo
    } = cargoDates;
    expression
        .where('c.id in ?', squelPostgres
            .select()
            .field('DISTINCT(c2.id)')
            .from(table.NAME, 'c2')
            .where(`c2.${cols.COMPANY_ID} ${checkExternalCars ? '<>' : '='} '${companyId}'`)
            .where(`c2.${cols.DELETED} = 'f'`)
            .where('dsh.id IS NULL OR dsh.id = ?', squelPostgres
                .select()
                .field('hdsh.id')
                .from(tableDealsStatusesHistory.NAME, 'hdsh')
                .where(`hdsh.${colsDealsStatusesHistory.DEAL_ID} = d.id`)
                .order(colsDealsStatusesHistory.CREATED_AT, false)
                .limit(1)
            )
            .where(`dsh.id IS NULL OR dsh.${colsDealsStatusesHistory.DEAL_STATUS_ID} IN ? OR
                (
                    CASE
                        WHEN crg.${colsCargos.UPLOADING_DATE_FROM} > '${upFrom}' THEN (
                            (crg.${colsCargos.UPLOADING_DATE_TO} IS NOT NULL AND '${downTo}' < crg.${colsCargos.UPLOADING_DATE_TO}) OR
                            (crg.${colsCargos.UPLOADING_DATE_TO} IS NULL AND '${downTo}' < crg.${colsCargos.DOWNLOADING_DATE_TO})
                        )
                        ELSE (
                            ${upTo ? `crg.${colsCargos.DOWNLOADING_DATE_TO} < '${upTo}'` : `crg.${colsCargos.DOWNLOADING_DATE_TO} < '${downTo}'`}
                        )
                    END
                )`, squelPostgres
                .select()
                .field('ds.id')
                .from(tableDealsStatuses.NAME, 'ds')
                .where(`ds.${colsDealsStatuses.NAME} IN ?`, FINISHED_STATUSES_LIST)
            )
            .left_join(tableDeals.NAME, 'd', `d.${colsDeals.CAR_ID} = c2.id`)
            .left_join(tableDealsStatusesHistory.NAME, 'dsh', `dsh.${colsDealsStatusesHistory.DEAL_ID} = d.id`)
            .left_join(tableCargos.NAME, 'crg', `crg.id = d.${colsDeals.CARGO_ID}`)
        );
};

const setDealAvailableCarsFilter = (expression, filteringObject) => {
    const filteringObjectSQLExpressions = [
        [HOMELESS_COLUMNS.CAR_STATE_NUMBER, `csn.${colsCarsStateNumbers.NUMBER}::text ILIKE '%${filteringObject[HOMELESS_COLUMNS.CAR_STATE_NUMBER]}%'`],
    ];

    for (let [key, exp] of filteringObjectSQLExpressions) {
        if (get(filteringObject, key) !== undefined) {
            expression = expression.where(exp);
        }
    }
    return expression;
};

const selectAvailableCarsByIdsAndCompanyId = (ids, companyId) => squelPostgres // todo: check full availability
    .select()
    .from(table.NAME, 'c')
    .field('c.*')
    .field('t.id', HOMELESS_COLUMNS.TRAILER_ID)
    .where('c.id IN ?', ids)
    .where(`c.${cols.COMPANY_ID} = '${companyId}'`)
    .where(`c.${cols.DELETED} = 'f'`)
    .left_join(tableTrailers.NAME, 't', `t.${colsTrailers.CAR_ID} = c.id`)
    .toString();

const selectAvailableCarByIdAndCompanyId = (id, companyId, cargoDates, checkExternalCars) => {
    let expression = squelPostgres
        .select()
        .field('c.*')
        .field('t.id', HOMELESS_COLUMNS.TRAILER_ID)
        .from(table.NAME, 'c');

    setAvailableCarsForDealFilter(expression, cargoDates, companyId, checkExternalCars);

    return expression
        .where(`c.id = '${id}'`)
        .left_join(tableTrailers.NAME, 't', `t.${colsTrailers.CAR_ID} = c.id`)
        .toString();
};

const selectRecordsByStateNumbers = numbers => squelPostgres
    .select()
    .from(table.NAME, 'c')
    .field('c.*')
    .field(`csn.${colsCarsStateNumbers.NUMBER}`, HOMELESS_COLUMNS.CAR_STATE_NUMBER)
    .where(`csn.${colsCarsStateNumbers.IS_ACTIVE} = 't'`)
    .where(`csn.${colsCarsStateNumbers.NUMBER} IN ?`, numbers)
    .left_join(tableCarsStateNumbers.NAME, 'csn', `csn.${colsCarsStateNumbers.CAR_ID} = c.id`)
    .toString();

module.exports = {
    insertRecord,
    insertRecords,
    updateRecord,
    selectRecordById,
    selectRecordWithActiveDealsById,
    selectRecordByIdWithDeleted,
    selectCarsByCompanyIdPaginationSorting,
    selectCountCarsByCompanyId,
    selectRecordByStateNumberAndActive,
    selectRecordByIdAndCompanyIdLight,
    selectRecordByIdFull,
    selectRecordByIdAndCompanyIdWithoutTrailer,
    selectAvailableCarsByCompanyIdPaginationSorting,
    selectCountAvailableCarsByCompanyId,
    selectAvailableCarsByIdsAndCompanyId,
    selectAvailableCarByIdAndCompanyId,
    selectRecordsByStateNumbers,
    selectRecordsForSearch,
    selectAllNewRecordsForSearch,
};
