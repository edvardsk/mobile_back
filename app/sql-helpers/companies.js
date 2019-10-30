const squel = require('squel');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { Geo } = require('constants/instances');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.COMPANIES;
const tableUsers = SQL_TABLES.USERS;
const tableUsersCompanies = SQL_TABLES.USERS_TO_COMPANIES;

const cols = table.COLUMNS;
const colsUsers = tableUsers.COLUMNS;
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
    .from(table.NAME)
    .where(`id = '${id}'`)
    .toString();

const selectCompanyByUserId = userId => squelPostgres
    .select()
    .from(table.NAME, 'c')
    .field('c.*')
    .where(`uc.${colsUsersCompanies.USER_ID} = '${userId}'`)
    .left_join(tableUsersCompanies.NAME, 'uc', `c.id = uc.${colsUsersCompanies.COMPANY_ID}`)
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

module.exports = {
    insertCompany,
    updateCompany,
    selectCompanyById,
    selectCompanyByUserId,
    selectCompanyBySettlementAccountWithFirstOwner,
    selectCompanyByIdentityNumberWithFirstOwner,
    selectCompanyByNameWithFirstOwner,
    selectCompanyByStateRegistrationCertificateNumberWithFirstOwner,
};
