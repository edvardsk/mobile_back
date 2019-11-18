const squel = require('squel');
const { get } = require('lodash');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.ECONOMIC_SETTINGS;

const cols = table.COLUMNS;

const insertRecord = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFields(values)
    .returning('*')
    .toString();

const updateRecordByCompanyId = (companyId, values) => squelPostgres
    .update()
    .table(table.NAME)
    .setFields(values)
    .where(`${cols.COMPANY_ID} = '${companyId}'`)
    .returning('*')
    .toString();

const deleteRecordByCompanyId = companyId => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`${cols.COMPANY_ID} = '${companyId}'`)
    .returning('*')
    .toString();

const updateRecordWithNullCompanyId = values => squelPostgres
    .update()
    .table(table.NAME)
    .setFields(values)
    .where(`${cols.COMPANY_ID} IS NULL`)
    .returning('*')
    .toString();

const selectRecordWithNullCompanyId = () => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.COMPANY_ID} IS NULL`)
    .toString();

const selectRecordByCompanyId = companyId => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.COMPANY_ID} = '${companyId}'`)
    .toString();

const selectCompaniesEconomicSettingsPaginationSorting = (limit, offset, sortColumn, asc, filter) => {
    let expression = squelPostgres
        .select()
        .from(table.NAME, 'e')
        .where(`e.${cols.COMPANY_ID} IS NOT NULL`);

    expression = setCompaniesEconomicSettingsFilter(expression, filter);
    return expression
        .order(sortColumn, asc)
        .limit(limit)
        .offset(offset)
        .toString();
};

const selectCountCompaniesEconomicSettings = filter => {
    let expression = squelPostgres
        .select()
        .from(table.NAME, 'e')
        .field('COUNT(e.id)')
        .where(`e.${cols.COMPANY_ID} IS NOT NULL`);

    expression = setCompaniesEconomicSettingsFilter(expression, filter);
    return expression
        .toString();
};

const setCompaniesEconomicSettingsFilter = (expression, filteringObject) => {
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

module.exports = {
    insertRecord,
    updateRecordByCompanyId,
    deleteRecordByCompanyId,
    updateRecordWithNullCompanyId,
    selectRecordWithNullCompanyId,
    selectRecordByCompanyId,
    selectCompaniesEconomicSettingsPaginationSorting,
    selectCountCompaniesEconomicSettings,
};
