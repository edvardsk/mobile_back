const squel = require('squel');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { Geo } = require('constants/instances');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.POINTS;
const tablePointTranslations = SQL_TABLES.POINT_TRANSLATIONS;

const cols = table.COLUMNS;
const colsPointTranslations = tablePointTranslations.COLUMNS;

squelPostgres.registerValueHandler(Geo, function(value) {
    return value.toString();
});

const insertRecords = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFieldsRows(values)
    .returning('*')
    .toString();

const selectRecordsByPoints = points => squelPostgres
    .select()
    .from(table.NAME)
    .field('*')
    .field(`ST_AsText(${cols.COORDINATES})`, cols.COORDINATES)
    .where(`${cols.COORDINATES} IN ?`, points)
    .toString();

const selectRecordsByPoint = point => squelPostgres
    .select()
    .from(table.NAME)
    .field('*')
    .field(`ST_AsText(${cols.COORDINATES})`, cols.COORDINATES)
    .where(`${cols.COORDINATES} = '${point}'`)
    .toString();

const selectRecordById = id => squelPostgres
    .select()
    .from(table.NAME)
    .field('*')
    .field(`ST_AsText(${cols.COORDINATES})`, cols.COORDINATES)
    .where(`id = '${id}'`)
    .toString();

const selectRecordsByPointAndLanguageIdWithTranslations = (point, languageId) => squelPostgres
    .select()
    .from(table.NAME, 'p')
    .field('p.*')
    .field(`pt.${colsPointTranslations.VALUE}`, HOMELESS_COLUMNS.CITY_NAME)
    .field(`ST_AsText(p.${cols.COORDINATES})`, cols.COORDINATES)
    .where(`p.${cols.COORDINATES} = '${point}'`)
    .where(`pt.${colsPointTranslations.LANGUAGE_ID} = '${languageId}'`)
    .left_join(tablePointTranslations.NAME, 'pt', `pt.${colsPointTranslations.POINT_ID} = p.id`)
    .toString();

module.exports = {
    insertRecords,
    selectRecordsByPoints,
    selectRecordsByPoint,
    selectRecordsByPointAndLanguageIdWithTranslations,
    selectRecordById,
};
