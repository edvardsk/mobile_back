const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');
const { SqlArray } = require('constants/instances');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.DRAFT_TRAILERS;

const cols = table.COLUMNS;

squelPostgres.registerValueHandler(SqlArray, function(value) {
    return value.toString();
});

const insertRecord = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFields(values)
    .returning('*')
    .toString();

const updateRecordByTrailerId = (trailerId, values) => squelPostgres
    .update()
    .table(table.NAME)
    .setFields(values)
    .where(`${cols.TRAILER_ID} = '${trailerId}'`)
    .returning('*')
    .toString();

const updateRecordById = (id, values) => squelPostgres
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

const selectRecordById = id => squelPostgres
    .select()
    .from(table.NAME)
    .where(`id = '${id}'`)
    .toString();

const selectRecordByTrailerId = trailerId => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.TRAILER_ID} = '${trailerId}'`)
    .toString();

const updateRecordAppendCommentsById = (id, comments) => squelPostgres
    .update()
    .table(table.NAME)
    .set(`${cols.COMMENTS} = ${cols.COMMENTS} || '{${comments}}'`)
    .where(`id = '${id}'`)
    .returning('*')
    .toString();

module.exports = {
    insertRecord,
    updateRecordByTrailerId,
    updateRecordById,
    deleteRecordById,
    updateRecordAppendCommentsById,
    selectRecordById,
    selectRecordByTrailerId,
};
