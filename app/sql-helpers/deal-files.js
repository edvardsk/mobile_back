const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');
const { SqlArray } = require('constants/instances');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.DEAL_FILES;
const tableDealsToDealFiles = SQL_TABLES.DEALS_TO_DEAL_FILES;
const tableDealCarsFiles = SQL_TABLES.DEAL_CARS_TO_FILES;
const tableDealTrailersFiles = SQL_TABLES.DEAL_TRAILERS_TO_FILES;
const tableDealDriversFiles = SQL_TABLES.DEAL_DRIVERS_TO_FILES;

const colsDealsToDealFiles = tableDealsToDealFiles.COLUMNS;
const colsDealCarsFiles = tableDealCarsFiles.COLUMNS;
const colsDealTrailersFiles = tableDealTrailersFiles.COLUMNS;
const colsDealDriversFiles = tableDealDriversFiles.COLUMNS;

squelPostgres.registerValueHandler(SqlArray, function(value) {
    return value.toString();
});

const insertFiles = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFieldsRows(values)
    .returning('*')
    .toString();

const deleteFilesByIds = ids => squelPostgres
    .delete()
    .from(table.NAME)
    .where('id IN ?', ids)
    .returning('*')
    .toString();

const selectRecordsByDealId = dealId => squelPostgres
    .select()
    .field('df.*')
    .from(table.NAME, 'df')
    .where(`ddf.${colsDealsToDealFiles.DEAL_ID} = '${dealId}'`)
    .left_join(tableDealsToDealFiles.NAME, 'ddf', `ddf.${colsDealsToDealFiles.DEAL_FILE_ID} = df.id`)
    .toString();

const selectRecordsByDealCarId = dealCarId => squelPostgres
    .select()
    .field('df.*')
    .from(table.NAME, 'df')
    .where(`dcf.${colsDealCarsFiles.DEAL_CAR_ID} = '${dealCarId}'`)
    .left_join(tableDealCarsFiles.NAME, 'dcf', `dcf.${colsDealCarsFiles.DEAL_FILE_ID} = df.id`)
    .toString();

const selectRecordsByDealTrailerId = dealTrailerId => squelPostgres
    .select()
    .field('df.*')
    .from(table.NAME, 'df')
    .where(`dtf.${colsDealTrailersFiles.DEAL_TRAILER_ID} = '${dealTrailerId}'`)
    .left_join(tableDealTrailersFiles.NAME, 'dtf', `dtf.${colsDealTrailersFiles.DEAL_FILE_ID} = df.id`)
    .toString();

const selectRecordsByDealDriverId = dealDriverId => squelPostgres
    .select()
    .field('df.*')
    .from(table.NAME, 'df')
    .where(`ddf.${colsDealDriversFiles.DEAL_DRIVER_ID} = '${dealDriverId}'`)
    .left_join(tableDealDriversFiles.NAME, 'ddf', `ddf.${colsDealDriversFiles.DEAL_FILE_ID} = df.id`)
    .toString();

module.exports = {
    insertFiles,
    deleteFilesByIds,
    selectRecordsByDealId,
    selectRecordsByDealCarId,
    selectRecordsByDealTrailerId,
    selectRecordsByDealDriverId,
};
