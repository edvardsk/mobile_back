const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');
const { JOB_STATUSES_MAP } = require('constants/pg-jobs');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.PG_JOBS;

const cols = table.COLUMNS;

const selectRecordByNameAndDealId = (name, dealId) => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.NAME} = '${name}'`)
    .where(`${cols.DATA}->>'dealId' = '${dealId}'`)
    .where(`${cols.STATE} = '${JOB_STATUSES_MAP.CREATED}'`)
    .toString();

const deleteRecordByNameAndDealId = (name, dealId) => squelPostgres
    .delete()
    .from(table.NAME)
    .where(`${cols.NAME} = '${name}'`)
    .where(`${cols.DATA}->>'dealId' = '${dealId}'`)
    .where(`${cols.STATE} = '${JOB_STATUSES_MAP.CREATED}'`)
    .returning('*')
    .toString();

module.exports = {
    selectRecordByNameAndDealId,
    deleteRecordByNameAndDealId,
};


