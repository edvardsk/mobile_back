const squel = require('squel');
const { get } = require('lodash');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { Geo } = require('constants/instances');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.COMPANIES;
const tableUsers = SQL_TABLES.USERS;
const tableCountries = SQL_TABLES.COUNTRIES;
const tableRoles = SQL_TABLES.ROLES;
const tableUsersCompanies = SQL_TABLES.USERS_TO_COMPANIES;

const cols = table.COLUMNS;
const colsUsers = tableUsers.COLUMNS;
const colsCountries = tableCountries.COLUMNS;
const colsRoles = tableRoles.COLUMNS;
const colsUsersCompanies = tableUsersCompanies.COLUMNS;

squelPostgres.registerValueHandler(Geo, function(value) {
    return value.toString();
});

const insertCompany = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFields(values)
    .returning('*')
    .toString();

const updateCompany = (id, values) => squelPostgres
    .update()
    .table(table.NAME)
    .setFields(values)
    .where(`id = '${id}'`)
    .returning('*')
    .toString();

const selectCompanyById = id => squelPostgres
    .select()
    .field('c.*')
    .field(`ct.${colsCountries.NAME}`, HOMELESS_COLUMNS.BANK_COUNTRY)
    .field(`ST_AsText(${cols.LEGAL_CITY_COORDINATES})`, cols.LEGAL_CITY_COORDINATES)
    .field(`r.${colsRoles.NAME}`, HOMELESS_COLUMNS.HEAD_ROLE_NAME)
    .where(`c.id = '${id}'`)
    .from(table.NAME, 'c')
    .left_join(tableCountries.NAME, 'ct', `ct.id = c.${cols.BANK_COUNTRY_ID} `)
    .left_join(tableRoles.NAME, 'r', `r.id = c.${cols.HEAD_ROLE_ID} `)
    .toString();

const selectCompanyByUserId = userId => squelPostgres
    .select()
    .from(table.NAME, 'c')
    .field('c.*')
    .field(`ct.${colsCountries.NAME}`, HOMELESS_COLUMNS.BANK_COUNTRY)
    .field(`ST_AsText(${cols.LEGAL_CITY_COORDINATES})`, cols.LEGAL_CITY_COORDINATES)
    .field(`r.${colsRoles.NAME}`, HOMELESS_COLUMNS.HEAD_ROLE_NAME)
    .where(`uc.${colsUsersCompanies.USER_ID} = '${userId}'`)
    .left_join(tableUsersCompanies.NAME, 'uc', `c.id = uc.${colsUsersCompanies.COMPANY_ID}`)
    .left_join(tableCountries.NAME, 'ct', `ct.id = c.${cols.BANK_COUNTRY_ID} `)
    .left_join(tableRoles.NAME, 'r', `r.id = c.${cols.HEAD_ROLE_ID} `)
    .toString();

const selectCompanyBySettlementAccountWithFirstOwner = account => squelPostgres
    .select()
    .from(table.NAME, 'c')
    .field('c.*')
    .field(`uc.${colsUsersCompanies.USER_ID}`, HOMELESS_COLUMNS.OWNER_ID)
    .where(`${cols.SETTLEMENT_ACCOUNT} = '${account}'`)
    .left_join(tableUsersCompanies.NAME, 'uc', `c.id = uc.${colsUsersCompanies.COMPANY_ID}`)
    .left_join(tableUsers.NAME, 'u', `u.id = uc.${colsUsersCompanies.USER_ID}`)
    .order(colsUsers.CREATED_AT, true)
    .limit(1)
    .toString();

const selectCompanyByIdentityNumberWithFirstOwner = number => squelPostgres
    .select()
    .from(table.NAME, 'c')
    .field('c.*')
    .field(`uc.${colsUsersCompanies.USER_ID}`, HOMELESS_COLUMNS.OWNER_ID)
    .where(`${cols.IDENTITY_NUMBER} = '${number}'`)
    .left_join(tableUsersCompanies.NAME, 'uc', `c.id = uc.${colsUsersCompanies.COMPANY_ID}`)
    .left_join(tableUsers.NAME, 'u', `u.id = uc.${colsUsersCompanies.USER_ID}`)
    .order(colsUsers.CREATED_AT, true)
    .limit(1)
    .toString();

const selectCompanyByNameWithFirstOwner = name => squelPostgres
    .select()
    .from(table.NAME, 'c')
    .field('c.*')
    .field(`uc.${colsUsersCompanies.USER_ID}`, HOMELESS_COLUMNS.OWNER_ID)
    .where(`${cols.NAME} = '${name}'`)
    .left_join(tableUsersCompanies.NAME, 'uc', `c.id = uc.${colsUsersCompanies.COMPANY_ID}`)
    .left_join(tableUsers.NAME, 'u', `u.id = uc.${colsUsersCompanies.USER_ID}`)
    .order(colsUsers.CREATED_AT, true)
    .limit(1)
    .toString();

const selectCompanyByStateRegistrationCertificateNumberWithFirstOwner = number => squelPostgres
    .select()
    .from(table.NAME, 'c')
    .field('c.*')
    .field(`uc.${colsUsersCompanies.USER_ID}`, HOMELESS_COLUMNS.OWNER_ID)
    .where(`${cols.STATE_REGISTRATION_CERTIFICATE_NUMBER} = '${number}'`)
    .left_join(tableUsersCompanies.NAME, 'uc', `c.id = uc.${colsUsersCompanies.COMPANY_ID}`)
    .left_join(tableUsers.NAME, 'u', `u.id = uc.${colsUsersCompanies.USER_ID}`)
    .order(colsUsers.CREATED_AT, true)
    .limit(1)
    .toString();

const selectCompaniesPaginationSorting = (limit, offset, sortColumn, asc, filter) => {
    let expression = squelPostgres
        .select()
        .field('c.*')
        .field(`r.${colsRoles.NAME}`, HOMELESS_COLUMNS.HEAD_ROLE_NAME)
        .from(table.NAME, 'c');

    expression = setCompaniesFilter(expression, filter);
    return expression
        .left_join(tableRoles.NAME, 'r', `r.id = c.${cols.HEAD_ROLE_ID}`)
        .order(sortColumn, asc)
        .limit(limit)
        .offset(offset)
        .toString();
};

const selectCountCompanies = (filter) => {
    let expression = squelPostgres
        .select()
        .field('COUNT(c.id)')
        .from(table.NAME, 'c');

    expression = setCompaniesFilter(expression, filter);
    return expression
        .toString();
};

const setCompaniesFilter = (expression, filteringObject) => {
    const filteringObjectSQLExpressions = [
        [cols.PRIMARY_CONFIRMED, `${cols.PRIMARY_CONFIRMED} = ${filteringObject[cols.PRIMARY_CONFIRMED]}`],
        [cols.EDITING_CONFIRMED, `${cols.EDITING_CONFIRMED} = ${filteringObject[cols.EDITING_CONFIRMED]}`],
    ];

    for (let [key, exp] of filteringObjectSQLExpressions) {
        if (get(filteringObject, key) !== undefined) {
            expression = expression.where(exp);
        }
    }
    return expression;
};

const selectCompaniesByIds = ids => squelPostgres
    .select()
    .from(table.NAME)
    .where('id IN ?', ids)
    .toString();

module.exports = {
    insertCompany,
    updateCompany,
    selectCompanyById,
    selectCompanyByUserId,
    selectCompanyBySettlementAccountWithFirstOwner,
    selectCompanyByIdentityNumberWithFirstOwner,
    selectCompanyByNameWithFirstOwner,
    selectCompanyByStateRegistrationCertificateNumberWithFirstOwner,
    selectCompaniesPaginationSorting,
    selectCountCompanies,
    selectCompaniesByIds,
};
