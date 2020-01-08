const squel = require('squel');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.DEAL_DRIVERS;
const tableDrivers = SQL_TABLES.DRIVERS;
const tableUsers = SQL_TABLES.USERS;
const tablePhonePrefixes = SQL_TABLES.PHONE_PREFIXES;

const cols = table.COLUMNS;
const colsDrivers = tableDrivers.COLUMNS;
const colsPhonePrefixes = tablePhonePrefixes.COLUMNS;

const insertRecord = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFields(values)
    .returning('*')
    .toString();

const updateRecordByDriverId = (driverId, values) => squelPostgres
    .update()
    .table(table.NAME)
    .setFields(values)
    .where(`${cols.DRIVER_ID} = '${driverId}'`)
    .returning('*')
    .toString();

const updateRecord = (id, values) => squelPostgres
    .update()
    .table(table.NAME)
    .setFields(values)
    .where(`id = '${id}'`)
    .returning('*')
    .toString();

const deleteRecordById = id => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`id = '${id}'`)
    .returning('*')
    .toString();

const selectRecordByDriverId = driverId => squelPostgres
    .select()
    .field('dd.*')
    .field(`CONCAT(pp.${colsPhonePrefixes.CODE}, dd.${cols.NUMBER})::bigint`, HOMELESS_COLUMNS.FULL_PHONE_NUMBER)
    .from(table.NAME, 'dd')
    .where(`dd.${cols.DRIVER_ID} = '${driverId}'`)
    .left_join(tablePhonePrefixes.NAME, 'pp', `pp.id = dd.${cols.PHONE_PREFIX_ID}`)
    .toString();

const selectRecordById = id => squelPostgres
    .select()
    .field('dd.*')
    .field(`CONCAT(pp.${colsPhonePrefixes.CODE}, dd.${cols.NUMBER})::bigint`, HOMELESS_COLUMNS.FULL_PHONE_NUMBER)
    .from(table.NAME, 'dd')
    .where(`dd.id = '${id}'`)
    .left_join(tablePhonePrefixes.NAME, 'pp', `pp.id = dd.${cols.PHONE_PREFIX_ID}`)
    .toString();

const selectRecordByUserId = userId => squelPostgres
    .select()
    .field('dd.*')
    .field(`pp.${colsPhonePrefixes.CODE}`, colsPhonePrefixes.CODE)
    .from(table.NAME, 'dd')
    .where(`u.id = '${userId}'`)
    .left_join(tableDrivers.NAME, 'd', `d.id = dd.${cols.DRIVER_ID}`)
    .left_join(tableUsers.NAME, 'u', `u.id = d.${colsDrivers.USER_ID}`)
    .left_join(tablePhonePrefixes.NAME, 'pp', `pp.id = dd.${cols.PHONE_PREFIX_ID}`)
    .toString();

module.exports = {
    insertRecord,
    updateRecordByDriverId,
    updateRecord,
    deleteRecordById,
    selectRecordByDriverId,
    selectRecordById,
    selectRecordByUserId,
};
