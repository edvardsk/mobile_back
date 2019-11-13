const { success } = require('api/response');

// services
const CompaniesService = require('services/tables/companies');
const TablesService = require('services/tables');

// constants
const { ROLES } = require('constants/system');
const { SUCCESS_CODES } = require('constants/http-codes');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

// formatters
const FinishRegistrationFormatters = require('formatters/finish-registration');
const { formatCompanyDataOnStep2 } = require('formatters/companies');

const MAP_ROLES_AND_FORMATTERS_STEP_1 = {
    [ROLES.TRANSPORTER]: FinishRegistrationFormatters.formatCompanyForTransporterToSave,
    [ROLES.HOLDER]: FinishRegistrationFormatters.formatCompanyForHolderToSave,
    [ROLES.INDIVIDUAL_FORWARDER]: FinishRegistrationFormatters.formatCompanyForIndividualForwarderToSave,
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: FinishRegistrationFormatters.formatCompanyForSoleProprietorForwarderToSave,
};

const colsCompanies = SQL_TABLES.COMPANIES.COLUMNS;

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
        const transactionList = [];

        const companyData = formatCompanyDataOnStep2(body);

        if (!isControlRole) {
            companyData[colsCompanies.EDITING_CONFIRMED] = false;
        }

        transactionList.push(
            CompaniesService.updateCompanyAsTransaction(company.id, companyData)
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
