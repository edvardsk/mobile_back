const { success } = require('api/response');

// services
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
    [ROLES.TRANSPORTER]: formatLegalDataForTransporterAndHolderForResponse,
    [ROLES.HOLDER]: formatLegalDataForTransporterAndHolderForResponse,
    [ROLES.INDIVIDUAL_FORWARDER]: formatLegalDataForIndividualForwarderForResponse,
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: formatLegalDataForSoleProprietorForwarderForResponse,
};

const getLegalData = async (req, res, next) => {
    try {
        const { company } = res.locals;

        const headRole = company[HOMELESS_COLUMNS.HEAD_ROLE_NAME];

        let firstUserInCompanyData = {};

        if ([ROLES.INDIVIDUAL_FORWARDER, ROLES.SOLE_PROPRIETOR_FORWARDER].includes(headRole)) {
            firstUserInCompanyData = await UsersService.getFirstUserInCompanyStrict(company.id);
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
