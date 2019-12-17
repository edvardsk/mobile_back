const { success } = require('api/response');

// services
const TNVEDCodesKeywordsService = require('services/tables/tnved-codes-keywords');
const LanguagesServices = require('services/tables/languages');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { LANGUAGE_CODES_MAP } = require('constants/languages');

const cols = SQL_TABLES.TNVED_CODES_KEYWORDS.COLUMNS;

const getKeywordsByTNVEDCodeId = async (req, res, next) => {
    try {
        const { query } = req;
        const tnvedCodeId = query[cols.TNVED_CODE_ID];

        const queryLanguage = query[HOMELESS_COLUMNS.LANGUAGE_CODE];

        let languageCode = LANGUAGE_CODES_MAP.EN;

        if (queryLanguage) {
            languageCode = queryLanguage.slice(0, 2).toLowerCase();
        }

        const [language, defaultLanguage] = await Promise.all([
            LanguagesServices.getLanguageByCode(languageCode),
            LanguagesServices.getLanguageByCodeStrict(LANGUAGE_CODES_MAP.EN),
        ]);

        const keywordsLanguageId = (language && language.id) || defaultLanguage.id;

        const keywords = await TNVEDCodesKeywordsService.getRecordsByTNVEDIdAndLanguage(tnvedCodeId, keywordsLanguageId);
        return success(res, { keywords });
    } catch (error) {
        next(error);
    }
};

const getAllKeywords = async (req, res, next) => {
    try {
        const keywords = await TNVEDCodesKeywordsService.getRecords();
        return success(res, { keywords });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllKeywords,
    getKeywordsByTNVEDCodeId,
};
