const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.CARGO_PRICES;

const cols = table.COLUMNS;

const insertRecords = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFieldsRows(values)
    .returning('*')
    .toString();

const deleteRecordsByCargoId = cargoId => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`${cols.CARGO_ID} = '${cargoId}'`)
    .returning('*')
    .toString();

module.exports = {
    insertRecords,
    deleteRecordsByCargoId,
};
