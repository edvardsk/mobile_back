const { success } = require('api/response');

// services
const CompaniesService = require('services/tables/companies');
const TablesService = require('services/tables');
const PointsService = require('services/tables/points');
const PointTranslationsService = require('services/tables/point-translations');
const LanguagesService = require('services/tables/languages');
const BackgroundService = require('services/background/creators');

// constants
const { ROLES } = require('constants/system');
const { SUCCESS_CODES } = require('constants/http-codes');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { DEFAULT_LANGUAGE } = require('constants/languages');

// formatters
const FinishRegistrationFormatters = require('formatters/finish-registration');
const PointsFormatters = require('formatters/points');
const { formatCompanyDataOnStep2 } = require('formatters/companies');

const MAP_ROLES_AND_FORMATTERS_STEP_1 = {
    [ROLES.TRANSPORTER]: FinishRegistrationFormatters.formatCompanyForTransporterToSave,
    [ROLES.HOLDER]: FinishRegistrationFormatters.formatCompanyForHolderToSave,
    [ROLES.INDIVIDUAL_FORWARDER]: FinishRegistrationFormatters.formatCompanyForIndividualForwarderToSave,
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: FinishRegistrationFormatters.formatCompanyForSoleProprietorForwarderToSave,
};

const colsCompanies = SQL_TABLES.COMPANIES.COLUMNS;
const colsPoints = SQL_TABLES.POINTS.COLUMNS;
const colsTranslations = SQL_TABLES.POINT_TRANSLATIONS.COLUMNS;

/*
* @res.locals {company} - current company
* @res.locals {isControlRole} - is user control role
* */
const editStep1 = async (req, res, next) => {
    try {
        const { company, isControlRole } = res.locals;
        const headRole = company[HOMELESS_COLUMNS.HEAD_ROLE_NAME];

        const transactionList = [];

        const companyData = {
            ...req.body,
        };

        if (!isControlRole) {
            companyData[colsCompanies.EDITING_CONFIRMED] = false;
        }

        transactionList.push(
            CompaniesService.updateCompanyAsTransaction(company.id, MAP_ROLES_AND_FORMATTERS_STEP_1[headRole](companyData))
        );

        await TablesService.runTransaction(transactionList);

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

/*
* @res.locals {company} - current company
* @res.locals {isControlRole} - is user control role
* */
const editStep2 = async (req, res, next) => {
    try {
        const { isControlRole, company } = res.locals;
        const { body } = req;
        const transactionsList = [];

        const companyData = formatCompanyDataOnStep2(body);

        if (!isControlRole) {
            companyData[colsCompanies.EDITING_CONFIRMED] = false;
        }

        transactionsList.push(
            CompaniesService.updateCompanyAsTransaction(company.id, companyData)
        );

        const coordinates = companyData[colsCompanies.LEGAL_CITY_COORDINATES].toPointString();

        const point = await PointsService.getRecordsByPoint(coordinates);
        let translationsList = [];
        if (!point) {
            const enLanguage = await LanguagesService.getLanguageByCodeStrict(DEFAULT_LANGUAGE);

            const point = {
                [colsPoints.COORDINATES]: coordinates,
                [HOMELESS_COLUMNS.NAME_EN]: body[colsCompanies.LEGAL_CITY_COORDINATES][HOMELESS_COLUMNS.NAME_EN],
            };

            const [points, translations] = PointsFormatters.formatPointsAndTranslationsToSave([point], enLanguage.id);

            translationsList = [...translations];

            transactionsList.push(
                PointsService.addRecordsAsTransaction(points)
            );
            transactionsList.push(
                PointTranslationsService.addRecordsAsTransaction(translations)
            );
        }

        await TablesService.runTransaction(transactionsList);

        if (translationsList.length) {
            const languages = await LanguagesService.getLanguagesWithoutEng();
            await Promise.all(translationsList.reduce((acc, translate) => {
                const translations = languages.map(language => (
                    BackgroundService.translateCoordinatesCreator(translate[colsTranslations.POINT_ID], language))
                );
                return [...acc, translations];
            }, []));
        }

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

/*
* @res.locals {company} - current company
* @res.locals {isControlRole} - is user control role
* */
const editStep3 = async (req, res, next) => {
    try {
        const { isControlRole, company } = res.locals;
        const transactionsList = [];

        if (!isControlRole) {
            const companyData = {
                [colsCompanies.EDITING_CONFIRMED]: false,
            };
            transactionsList.push(
                CompaniesService.updateCompanyAsTransaction(company.id, companyData)
            );
        }

        res.locals.step3Data = {};
        res.locals.step3Data.transactionList = transactionsList;
        res.locals.step3Data.isEditOperation = true;

        return next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    editStep1,
    editStep2,
    editStep3,
};
