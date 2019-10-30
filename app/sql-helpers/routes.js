const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');
const { Geo } = require('constants/instances');

const squelPostgres = squel.useFlavour('postgres');

squelPostgres.registerValueHandler(Geo, function(value) {
    return value.toString();
});

const table = SQL_TABLES.ROUTES;

const cols = table.COLUMNS;

const insertRecords = values => squelPostgres
    .insert()
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
