const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.COMPANIES;
const tableUsersCompanies = SQL_TABLES.USERS_TO_COMPANIES;

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

module.exports = {
    insertCompany,
    updateCompany,
    selectCompanyByUserId,
};
