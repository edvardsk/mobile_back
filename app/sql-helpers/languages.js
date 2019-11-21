const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.LANGUAGES;

const cols = table.COLUMNS;

const selectLanguageById = id => squelPostgres
    .select()
    .from(table.NAME)
    .where(`id = '${id}'`)
    .toString();

const selectLanguageByCode = code => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.CODE} = '${code}'`)
    .toString();

const selectLanguages = () => squelPostgres
    .select()
    .from(table.NAME)
    .toString();

module.exports = {
    selectLanguageById,
    selectLanguageByCode,
    selectLanguages,
};
