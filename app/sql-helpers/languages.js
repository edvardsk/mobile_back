const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.LANGUAGES;

const selectLanguageById = id => squelPostgres
    .select()
    .from(table.NAME)
    .where(`id = '${id}'`)
    .toString();

const selectLanguages = () => squelPostgres
    .select()
    .from(table.NAME)
    .toString();

module.exports = {
    selectLanguageById,
    selectLanguages,
};
