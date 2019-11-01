const { success, reject } = require('api/response');

// services
const CompaniesService = require('services/tables/companies');
const UsersService = require('services/tables/users');

// formatters
const {
    formatLegalDataForTransporterAndHolderForResponse,
    formatLegalDataForIndividualForwarderForResponse,
    formatLegalDataForSoleProprietorForwarderForResponse,
} = require('formatters/companies');

// constants
const {
    ROLES,
    MAP_COMPANY_OWNERS_TO_MAIN_ROLES,
} = require('constants/system');
const { ERRORS } = require('constants/errors');
const { HOMELESS_COLUMNS } = require('constants/tables');

const MAP_ROLE_TO_FORMATTER = {
    [ROLES.TRANSPORTER]: formatLegalDataForTransporterAndHolderForResponse,
    [ROLES.HOLDER]: formatLegalDataForTransporterAndHolderForResponse,
    [ROLES.INDIVIDUAL_FORWARDER]: formatLegalDataForIndividualForwarderForResponse,
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: formatLegalDataForSoleProprietorForwarderForResponse,
};

const getLegalData = async (req, res, next) => {
    try {
        const currentUserId = res.locals.user.id;
        const { isControlRole } = res.locals.user;
        const { shadowUserId } = res.locals;

        let companyHeadId;
        if (isControlRole) {
            companyHeadId = shadowUserId;
        } else {
            companyHeadId = currentUserId;
        }

        const company = await CompaniesService.getCompanyByUserId(companyHeadId);
        if (!company) {
            return reject(res, ERRORS.COMPANIES.INVALID_COMPANY_ID);
        }

        const firstUserInCompanyData = await UsersService.getFirstUserInCompanyStrict(company.id);

        const userRole = firstUserInCompanyData[HOMELESS_COLUMNS.ROLE];
        const mainRole = MAP_COMPANY_OWNERS_TO_MAIN_ROLES[userRole];

        const legalData = MAP_ROLE_TO_FORMATTER[mainRole](company, firstUserInCompanyData);

        return success(res, { legal_data: legalData });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLegalData,
};
