const { success } = require('api/response');

// services
const TNVEDCodesService = require('services/tables/tnved-codes');
// const LanguagesServices = require('services/tables/languages');

// // constants
// const { HOMELESS_COLUMNS } = require('constants/tables');
// const { LANGUAGE_CODES_MAP } = require('constants/languages');

const getCodesByKeyword = async (req, res, next) => {
    try {
        // const { query } = req;
        // const queryLanguage = query[HOMELESS_COLUMNS.LANGUAGE_CODE];
        // let languageCode = LANGUAGE_CODES_MAP.EN;

        // if (queryLanguage) {
        //     languageCode = queryLanguage.slice(0, 2).toLowerCase();
        // }

        // const [language, defaultLanguage] = await Promise.all([
        //     LanguagesServices.getLanguageByCode(languageCode),
        //     LanguagesServices.getLanguageByCodeStrict(LANGUAGE_CODES_MAP.EN),
        // ]);

        // const tnvedLanguageId = (language && language.id) || defaultLanguage.id;

        // console.log(tnvedLanguageId);

        const codes = await TNVEDCodesService.getRecords();
        return success(res, { codes });
    } catch (error) {
        next(error);
    }
};

const getAllCodes = async (req, res, next) => {
    try {
        const codes = await TNVEDCodesService.getRecords();
        return success(res, { codes });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCodesByKeyword,
    getAllCodes,
};
