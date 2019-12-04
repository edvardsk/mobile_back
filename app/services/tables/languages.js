const  { one, oneOrNone, manyOrNone } = require('db');

// sql-helpers
const {
    selectLanguageById,
    selectLanguageByCode,
    selectLanguages,
    selectLanguagesWithoutEng,
} = require('sql-helpers/languages');

const getLanguage = id => oneOrNone(selectLanguageById(id));

const getLanguageStrict = id => one(selectLanguageById(id));

const getLanguageByCodeStrict = code => one(selectLanguageByCode(code));

const getLanguageByCode = code => oneOrNone(selectLanguageByCode(code));

const getLanguages = () => manyOrNone(selectLanguages());

const getLanguagesWithoutEng = () => manyOrNone(selectLanguagesWithoutEng());

const checkLanguageExists = async (schema, id) => {
    const language = await getLanguage(id);
    return !!language;
};

module.exports = {
    getLanguage,
    getLanguageStrict,
    getLanguageByCode,
    getLanguageByCodeStrict,
    getLanguages,
    getLanguagesWithoutEng,

    checkLanguageExists,
};
