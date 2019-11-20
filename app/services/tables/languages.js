const  { one, oneOrNone, manyOrNone } = require('db');

// sql-helpers
const {
    selectLanguageById,
    selectLanguages,
} = require('sql-helpers/languages');

const getLanguage = id => oneOrNone(selectLanguageById(id));

const getLanguageStrict = id => one(selectLanguageById(id));

const getLanguages = () => manyOrNone(selectLanguages());

const checkLanguageExists = async (schema, id) => {
    const language = await getLanguage(id);
    return !!language;
};

module.exports = {
    getLanguage,
    getLanguageStrict,
    getLanguages,

    checkLanguageExists,
};
