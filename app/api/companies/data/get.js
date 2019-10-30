const { success } = require('api/response');

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
} = require('constants/system');
const { HOMELESS_COLUMNS } = require('constants/tables');

const MAP_ROLE_TO_FORMATTER = {
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER]: formatLegalDataForTransporterAndHolderForResponse,
    [ROLES.TRANSPORTER]: formatLegalDataForTransporterAndHolderForResponse,

    [ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER]: formatLegalDataForTransporterAndHolderForResponse,
    [ROLES.HOLDER]: formatLegalDataForTransporterAndHolderForResponse,

    [ROLES.CONFIRMED_EMAIL_AND_PHONE_INDIVIDUAL_FORWARDER]: formatLegalDataForIndividualForwarderForResponse,
    [ROLES.INDIVIDUAL_FORWARDER]: formatLegalDataForIndividualForwarderForResponse,

    [ROLES.CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER]: formatLegalDataForSoleProprietorForwarderForResponse,
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: formatLegalDataForSoleProprietorForwarderForResponse,
};

const getLegalData = async (req, res, next) => {
    try {
        const currentUserId = res.locals.user.id;
        const isControlRole = res.locals.user.isControlRole;

        const { meOrId } = req.params;
        let company;
        let userData;

        if (isControlRole) {
            company = await CompaniesService.getCompany(meOrId);
            userData = await UsersService.getFirstUserInCompanyStrict(company.id);
        } else {
            company = await CompaniesService.getCompanyByUserId(currentUserId);
            userData = {
                ...res.locals.user,
            };
        }

        const userRole = userData[HOMELESS_COLUMNS.ROLE];

        const legalData = MAP_ROLE_TO_FORMATTER[userRole](company, userData);

        return success(res, { legal_data: legalData });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLegalData,
};
