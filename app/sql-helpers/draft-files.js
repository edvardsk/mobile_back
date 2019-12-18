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

const selectFilesByDraftDriverIdAndLabels = (draftDriverId, labelsArr) => {
    const exp = squelPostgres
        .select()
        .from(table.NAME, 'f')
        .field('f.*')
        .where(`ddf.${colsDraftDriversFiles.DRAFT_DRIVER_ID} = '${draftDriverId}'`);
    setLabelsArrFilter(exp, labelsArr);
    return exp
        .left_join(tableDraftDriversFiles.NAME, 'ddf', `ddf.${colsDraftDriversFiles.DRAFT_FILE_ID} = f.id`)
        .toString();
};

const selectFilesByDraftDriverId = (draftDriverId) => squelPostgres
    .select()
    .from(table.NAME, 'f')
    .field('f.*')
    .where(`ddf.${colsDraftDriversFiles.DRAFT_DRIVER_ID} = '${draftDriverId}'`)
    .left_join(tableDraftDriversFiles.NAME, 'ddf', `ddf.${colsDraftDriversFiles.DRAFT_FILE_ID} = f.id`)
    .toString();

const setLabelsArrFilter = (exp, labelsArr) => {
    const innerExp = squel
        .expr()
        .and(`f.${cols.LABELS} = ARRAY[${labelsArr[0].map(label => `'${label}'`).toString()}]`);

    labelsArr.forEach((labels, i) => {
        if (i) {
            innerExp
                .or(`f.${cols.LABELS} = ARRAY[${labels.map(label => `'${label}'`).toString()}]`);
        }
    });

    exp.where(innerExp);
};

module.exports = {
    insertFiles,
    deleteFilesByIds,
    selectFilesByDraftDriverIdAndLabels,
    selectFilesByDraftDriverId,
};
