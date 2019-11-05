const { success } = require('api/response');

// services
const CompaniesService = require('services/tables/companies');
const UsersService = require('services/tables/users');
const OtherOrganizationsService = require('services/tables/other-organizations');

// constants
const { ROLES } = require('constants/system');

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
* @req.params {user} - current user
* @req.params {permissions} - current permissions
* @req.params {isControlRole} - is current user admin or manager
* @req.params {shadowMainUserRole} - if control user role is used - role of company admin
* @req.params {shadowUserId} - if control user role is used - id of company admin
* */
const getStep1 = async (req, res, next) => {
    try {
        const currentUserId = res.locals.user.id;
        const currentUserRole = res.locals.user.role;
        const { isControlRole } = res.locals.user;
        const { shadowMainUserRole, shadowUserId } = res.locals;

        let companyHeadId;
        let companyHeadRole;
        if (isControlRole) {
            companyHeadId = shadowUserId;
            companyHeadRole = shadowMainUserRole;
        } else {
            companyHeadId = currentUserId;
            companyHeadRole = currentUserRole;
        }
        const company = await CompaniesService.getCompanyByUserIdStrict(companyHeadId);
        const formattedData = MAP_ROLES_AND_FORMATTERS_STEP_1[companyHeadRole](company);

        return success(res, { company: formattedData });
    } catch (error) {
        next(error);
    }
};

/*
* @req.params {user} - current user
* @req.params {permissions} - current permissions
* @req.params {isControlRole} - is current user admin or manager
* @req.params {shadowMainUserRole} - if control user role is used - role of company admin
* @req.params {shadowUserId} - if control user role is used - id of company admin
* */
const getStep2 = async (req, res, next) => {
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
        const company = await CompaniesService.getCompanyByUserIdStrict(companyHeadId);
        const formattedData = FinishRegistrationFormatters.formatDataForTransporterAndHolderForStep2Response(company);

        return success(res, { company: formattedData });
    } catch (error) {
        next(error);
    }
};

/*
* @req.params {user} - current user
* @req.params {permissions} - current permissions
* @req.params {isControlRole} - is current user admin or manager
* @req.params {shadowMainUserRole} - if control user role is used - role of company admin || from injectShadowCompanyHeadByMeOrId
* @req.params {shadowUserId} - if control user role is used - id of company admin
* */
const getStep3 = async (req, res, next) => {
    try {
        const currentUserId = res.locals.user.id;
        const currentUserRole = res.locals.user.role;
        const { isControlRole } = res.locals.user;
        const { shadowMainUserRole, shadowUserId } = res.locals;

        let companyHeadId;
        let companyHeadRole;
        if (isControlRole) {
            companyHeadId = shadowUserId;
            companyHeadRole = shadowMainUserRole;
        } else {
            companyHeadId = currentUserId;
            companyHeadRole = currentUserRole;
        }
        const company = await CompaniesService.getCompanyByUserIdStrict(companyHeadId);

        let user = {};
        let otherOrganizations = {};
        if ([ROLES.INDIVIDUAL_FORWARDER, ROLES.SOLE_PROPRIETOR_FORWARDER].includes(companyHeadRole)) {
            user = await UsersService.getUser(companyHeadId);
        }
        if ([ROLES.TRANSPORTER, ROLES.HOLDER].includes(companyHeadRole)) {
            otherOrganizations = await OtherOrganizationsService.getRecordsByCompanyId(company.id);
        }

        const formattedData = MAP_ROLES_AND_FORMATTERS_STEP_3[companyHeadRole](company, user, otherOrganizations);

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
