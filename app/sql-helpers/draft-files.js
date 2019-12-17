const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');
const { SqlArray } = require('constants/instances');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.DRAFT_FILES;
const tableDraftDriversFiles = SQL_TABLES.DRAFT_DRIVERS_TO_FILES;

const cols = table.COLUMNS;
const colsDraftDriversFiles = tableDraftDriversFiles.COLUMNS;

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

const selectFilesByDraftDriverIdAndLabels = (draftDriverId, labels) => squelPostgres
    .select()
    .from(table.NAME, 'f')
    .field('f.*')
    .where(`ddf.${colsDraftDriversFiles.DRAFT_DRIVER_ID} = '${draftDriverId}'`)
    .where(`f.${cols.LABELS} && ARRAY[${labels.map(label => `'${label}'`).toString()}]`)
    .left_join(tableDraftDriversFiles.NAME, 'ddf', `ddf.${colsDraftDriversFiles.DRAFT_FILE_ID} = f.id`)
    .toString();

module.exports = {
    insertFiles,
    deleteFilesByIds,
    selectFilesByDraftDriverIdAndLabels,
};
