const squel = require('squel');
const { get } = require('lodash');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.DRIVERS;
const tableUsers = SQL_TABLES.USERS;
const tableUsersCompanies = SQL_TABLES.USERS_TO_COMPANIES;
const tablePhoneNumbers = SQL_TABLES.PHONE_NUMBERS;
const tablePhonePrefixes = SQL_TABLES.PHONE_PREFIXES;

const cols = table.COLUMNS;
const colsUsers = tableUsers.COLUMNS;
const colsUsersCompanies = tableUsersCompanies.COLUMNS;
const colsPhoneNumbers = tablePhoneNumbers.COLUMNS;
const colsPhonePrefixes = tablePhonePrefixes.COLUMNS;

const insertRecord = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFields(values)
    .returning('*')
    .toString();

const updateRecordByUserId = (userId, values) => squelPostgres
    .update()
    .table(table.NAME)
    .setFields(values)
    .where(`${cols.USER_ID} = '${userId}'`)
    .returning('*')
    .toString();

const selectRecordByUserId = userId => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.USER_ID} = '${userId}'`)
    .toString();

const selectAvailableDriversPaginationSorting = (companyId, limit, offset, sortColumn, asc, filter) => {
    let expression = squelPostgres
        .select()
        .field('d.id', HOMELESS_COLUMNS.DRIVER_ID)
        .field('u.*')
        .field(`CONCAT(php.${colsPhonePrefixes.CODE}, phn.${colsPhoneNumbers.NUMBER})::bigint`, HOMELESS_COLUMNS.FULL_PHONE_NUMBER)
        .from(table.NAME, 'd')
        .where(`uc.${colsUsersCompanies.COMPANY_ID} = '${companyId}'`)
        .where(`u.${colsUsers.FREEZED} = 'f'`);

    expression = setAvailableDriversFilter(expression, filter);
    return expression
        .left_join(tableUsers.NAME, 'u', `u.id = d.${cols.USER_ID}`)
        .left_join(tableUsersCompanies.NAME, 'uc', `uc.${colsUsersCompanies.USER_ID} = u.id`)
        .left_join(tablePhoneNumbers.NAME, 'phn', `phn.${colsPhoneNumbers.USER_ID} = u.id`)
        .left_join(tablePhonePrefixes.NAME, 'php', `php.id = phn.${colsPhoneNumbers.PHONE_PREFIX_ID}`)
        .order(sortColumn, asc)
        .limit(limit)
        .offset(offset)
        .toString();
};

const selectCountAvailableDrivers = (companyId, filter) => {
    let expression = squelPostgres
        .select()
        .field('COUNT(d.id)')
        .from(table.NAME, 'd')
        .where(`uc.${colsUsersCompanies.COMPANY_ID} = '${companyId}'`)
        .where(`u.${colsUsers.FREEZED} = 'f'`);

    expression = setAvailableDriversFilter(expression, filter);
    return expression
        .left_join(tableUsers.NAME, 'u', `u.id = d.${cols.USER_ID}`)
        .left_join(tableUsersCompanies.NAME, 'uc', `uc.${colsUsersCompanies.USER_ID} = u.id`)
        .toString();
};

const setAvailableDriversFilter = (expression, filteringObject) => {
    const filteringObjectSQLExpressions = [
        [HOMELESS_COLUMNS.FULL_NAME, `u.${colsUsers.FULL_NAME}::text ILIKE '%${filteringObject[HOMELESS_COLUMNS.FULL_NAME]}%'`],
    ];

    for (let [key, exp] of filteringObjectSQLExpressions) {
        if (get(filteringObject, key) !== undefined) {
            expression = expression.where(exp);
        }
    }
    return expression;
};

const selectRecordByCompanyIdLight = companyId => squelPostgres
    .select()
    .field('d.id')
    .from(table.NAME, 'd')
    .where(`uc.${colsUsersCompanies.COMPANY_ID} = '${companyId}'`)
    .left_join(tableUsers.NAME, 'u', `u.id = d.${cols.USER_ID}`)
    .left_join(tableUsersCompanies.NAME, 'uc', `uc.${colsUsersCompanies.USER_ID} = u.id`)
    .toString();

module.exports = {
    insertRecord,
    updateRecordByUserId,
    selectRecordByUserId,
    selectAvailableDriversPaginationSorting,
    selectCountAvailableDrivers,
    selectRecordByCompanyIdLight,
};
