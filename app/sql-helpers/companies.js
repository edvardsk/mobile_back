const squel = require('squel');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.COMPANIES;
const tableUsersCompanies = SQL_TABLES.USERS_TO_COMPANIES;

const cols = table.COLUMNS;
const colsUsersCompanies = tableUsersCompanies.COLUMNS;

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
    .toString();

const selectCompanyByIdentityNumberWithFirstOwner = number => squelPostgres
    .select()
    .from(table.NAME, 'c')
    .field('c.*')
    .field(`uc.${colsUsersCompanies.USER_ID}`, HOMELESS_COLUMNS.OWNER_ID)
    .where(`${cols.IDENTITY_NUMBER} = '${number}'`)
    .left_join(tableUsersCompanies.NAME, 'uc', `c.id = uc.${colsUsersCompanies.COMPANY_ID}`)
    .toString();

module.exports = {
    insertCompany,
    updateCompany,
    selectCompanyByUserId,
    selectCompanyBySettlementAccountWithFirstOwner,
    selectCompanyByIdentityNumberWithFirstOwner,
};
