const { success } = require('api/response');

// services
const UsersService = require('services/tables/users');
const PointsService = require('services/tables/points');
const LanguagesService = require('services/tables/languages');

// formatters
const {
    formatLegalDataForTransporterAndHolderForResponse,
    formatLegalDataForIndividualForwarderForResponse,
    formatLegalDataForSoleProprietorForwarderForResponse,
} = require('formatters/companies');

// constants
const {
    ROLES,
} = require('constants/system');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { DEFAULT_LANGUAGE } = require('constants/languages');

const MAP_ROLE_TO_FORMATTER = {
    [ROLES.TRANSPORTER]: formatLegalDataForTransporterAndHolderForResponse,
    [ROLES.HOLDER]: formatLegalDataForTransporterAndHolderForResponse,
    [ROLES.INDIVIDUAL_FORWARDER]: formatLegalDataForIndividualForwarderForResponse,
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: formatLegalDataForSoleProprietorForwarderForResponse,
};

const colsUsers = SQL_TABLES.USERS.COLUMNS;
const colsCompanies = SQL_TABLES.COMPANIES.COLUMNS;

const getLegalData = async (req, res, next) => {
    try {
        const { company, user } = res.locals;
        const userLanguageId = user[colsUsers.LANGUAGE_ID];

        const headRole = company[HOMELESS_COLUMNS.HEAD_ROLE_NAME];

        let firstUserInCompanyData = {};

        if ([ROLES.INDIVIDUAL_FORWARDER, ROLES.SOLE_PROPRIETOR_FORWARDER].includes(headRole)) {
            firstUserInCompanyData = await UsersService.getFirstUserInCompanyStrict(company.id);
        }

        if ([ROLES.TRANSPORTER, ROLES.HOLDER, ROLES.SOLE_PROPRIETOR_FORWARDER].includes(headRole)) {
            let point = await PointsService.getRecordsByPointAndLanguageIdWithTranslationsStrict(
                company[colsCompanies.LEGAL_CITY_COORDINATES], userLanguageId
            );
            if (!point) {
                const enLanguage = await LanguagesService.getLanguageByCodeStrict(DEFAULT_LANGUAGE);
                point = await PointsService.getRecordsByPointAndLanguageIdWithTranslationsStrict(
                    company[colsCompanies.LEGAL_CITY_COORDINATES], enLanguage.id
                );
            }
            company[HOMELESS_COLUMNS.CITY_NAME] = point[HOMELESS_COLUMNS.CITY_NAME];
        }

        const legalData = MAP_ROLE_TO_FORMATTER[headRole](company, firstUserInCompanyData);

        return success(res, { legal_data: legalData });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLegalData,
};
