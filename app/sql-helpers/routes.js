const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const { isValidUUID } = require('helpers/validators');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.ROUTES;

const cols = table.COLUMNS;

const insertRecords = values => squelPostgres
    .insert({
        stringFormatter: str => isValidUUID(str) ? `'${str}'` : str,
    })
    .into(table.NAME)
    .setFieldsRows(values)
    .returning('*')
    .toString();

const deleteRecordsByCompanyId = companyId => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`${cols.COMPANY_ID} = '${companyId}'`)
    .returning('*')
    .toString();

module.exports = {
    insertRecords,
    deleteRecordsByCompanyId,
};
