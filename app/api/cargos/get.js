const { success } = require('api/response');

// services
const CargosServices = require('services/tables/cargos');
const LanguagesServices = require('services/tables/languages');
const EconomicSettingsServices = require('services/tables/economic-settings');
const CurrencyPrioritiesServices = require('services/tables/currency-priorities');

// formatters
const {
    formatRecordForUnauthorizedResponse,
} = require('formatters/cargos');
const { formatQueueByPriority } = require('formatters/index');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { LANGUAGE_CODES_MAP } = require('constants/languages');

const colsCurrencyPriorities = SQL_TABLES.CURRENCY_PRIORITIES.COLUMNS;

const getCargo = async (req, res, next) => {
    try {
        const { user } = res.locals;
        const { query } = req;
        const { cargoId } = req.params;
        const language = query[HOMELESS_COLUMNS.LANGUAGE_CODE];
        let languageCode = LANGUAGE_CODES_MAP.EN;
        if (user) {
            languageCode = user[HOMELESS_COLUMNS.LANGUAGE_CODE];
        } else if (language) {
            languageCode = language.slice(0, 2).toLowerCase();
        }
        const [userLanguage, defaultLanguage, defaultEconomicSettings, currencyPriorities] = await Promise.all([
            LanguagesServices.getLanguageByCode(languageCode),
            LanguagesServices.getLanguageByCodeStrict(LANGUAGE_CODES_MAP.EN),
            EconomicSettingsServices.getDefaultRecordStrict(),
            CurrencyPrioritiesServices.getRecords(),
        ]);
        const formattedCurrencyPriorities = formatQueueByPriority(
            currencyPriorities,
            colsCurrencyPriorities.CURRENCY_ID,
            colsCurrencyPriorities.NEXT_CURRENCY_ID
        );

        const searchLanguageId = (userLanguage && userLanguage.id) || defaultLanguage.id;

        const cargo = await CargosServices.getRecordStrictWithEconomicSettings(cargoId, searchLanguageId);
        const formattedCargos = formatRecordForUnauthorizedResponse(cargo, defaultEconomicSettings, searchLanguageId, formattedCurrencyPriorities);

        return success(res, { cargo: formattedCargos });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCargo,
};
