const { success } = require('api/response');

// services
const UsersService = require('services/tables/users');
const OtherOrganizationsService = require('services/tables/other-organizations');

// constants
const { ROLES } = require('constants/system');
const { HOMELESS_COLUMNS } = require('constants/tables');

// formatters
const FinishRegistrationFormatters = require('formatters/finish-registration');

const MAP_ROLES_AND_FORMATTERS_STEP_1 = {
    [ROLES.TRANSPORTER]: FinishRegistrationFormatters.formatDataForTransporterAndHolderForStep1Response,
    [ROLES.HOLDER]: FinishRegistrationFormatters.formatDataForTransporterAndHolderForStep1Response,
    [ROLES.INDIVIDUAL_FORWARDER]: FinishRegistrationFormatters.formatDataForIndividualForwarderForStep1Response,
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: FinishRegistrationFormatters.formatDataForSoleProprietorForwarderForStep1Response,
};

const MAP_ROLES_AND_FORMATTERS_STEP_3 = {
    [ROLES.TRANSPORTER]: FinishRegistrationFormatters.formatDataForTransporterForStep3Response,
    [ROLES.HOLDER]: FinishRegistrationFormatters.formatDataForHolderForStep3Response,
    [ROLES.INDIVIDUAL_FORWARDER]: FinishRegistrationFormatters.formatDataForIndividualForwarderForStep3Response,
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: FinishRegistrationFormatters.formatDataForSoleProprietorForwarderForStep3Response,
};

/*
* @res.locals {company} - current user
* */
const getStep1 = async (req, res, next) => {
    try {
        const { company } = res.locals;
        const headRole = company[HOMELESS_COLUMNS.HEAD_ROLE_NAME];
        const formattedData = MAP_ROLES_AND_FORMATTERS_STEP_1[headRole](company);

        return success(res, { company: formattedData });
    } catch (error) {
        next(error);
    }
};

/*
* @res.locals {company} - current user
* */
const getStep2 = async (req, res, next) => {
    try {
        const { company } = res.locals;
        const formattedData = FinishRegistrationFormatters.formatDataForTransporterAndHolderForStep2Response(company);

        return success(res, { company: formattedData });
    } catch (error) {
        next(error);
    }
};

/*
* @res.locals {company} - current user
* */
const getStep3 = async (req, res, next) => {
    try {
        const { company } = res.locals;

        let user = {};
        let otherOrganizations = {};

        const headRole = company[HOMELESS_COLUMNS.HEAD_ROLE_NAME];

        if ([ROLES.INDIVIDUAL_FORWARDER, ROLES.SOLE_PROPRIETOR_FORWARDER].includes(headRole)) {
            user = await UsersService.getFirstUserInCompanyStrict(company.id);
        }
        if ([ROLES.TRANSPORTER, ROLES.HOLDER].includes(headRole)) {
            otherOrganizations = await OtherOrganizationsService.getRecordsByCompanyId(company.id);
        }

        const formattedData = MAP_ROLES_AND_FORMATTERS_STEP_3[headRole](company, user, otherOrganizations);

        return success(res, { company: formattedData });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getStep1,
    getStep2,
    getStep3,
};
