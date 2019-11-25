const squel = require('squel');
const { get } = require('lodash');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { SqlArray } = require('constants/instances');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.CARS;
const tableCarsStateNumbers = SQL_TABLES.CARS_STATE_NUMBERS;

const cols = table.COLUMNS;
const colsCarsStateNumbers = tableCarsStateNumbers.COLUMNS;

squelPostgres.registerValueHandler(SqlArray, function(value) {
    return value.toString();
});

const insertRecord = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFields(values)
    .returning('*')
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
    .where(`csn.${colsCarsStateNumbers.NUMBER} = '${stateNumber}'`)
    .where(`csn.${colsCarsStateNumbers.IS_ACTIVE} = 't'`)
    .left_join(tableCarsStateNumbers.NAME, 'csn', `csn.${colsCarsStateNumbers.CAR_ID} = c.id`)
    .toString();

module.exports = {
    insertRecord,
    selectCarsByCompanyIdPaginationSorting,
    selectCountCarsByCompanyId,
    selectRecordByStateNumberAndActive,
};
