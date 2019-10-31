const { success } = require('api/response');

// services
const CompaniesService = require('services/tables/companies');
const UserPermissionsService = require('services/tables/users-to-permissions');
const TablesService = require('services/tables');

// constants
const { ROLES, PERMISSIONS } = require('constants/system');
const { SUCCESS_CODES } = require('constants/http-codes');

// formatters
const FinishRegistrationFormatters = require('formatters/finish-registration');
const { formatCompanyDataOnStep2 } = require('formatters/companies');

const MAP_ROLES_AND_FORMATTERS_STEP_1 = {
    [ROLES.TRANSPORTER]: FinishRegistrationFormatters.formatCompanyForTransporterToSave,
    [ROLES.HOLDER]: FinishRegistrationFormatters.formatCompanyForHolderToSave,
    [ROLES.INDIVIDUAL_FORWARDER]: FinishRegistrationFormatters.formatCompanyForIndividualForwarderToSave,
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: FinishRegistrationFormatters.formatCompanyForSoleProprietorForwarderToSave,
};

/*
* @req.params {user} - current user
* @req.params {permissions} - current permissions
* @req.params {isControlRole} - is current user admin or manager
* @req.params {shadowMainUserRole} - if control user role is used - role of company admin
* @req.params {shadowUserId} - if control user role is used - id of company admin
* */
const editStep1 = async (req, res, next) => {
    try {
        const currentUserId = res.locals.user.id;
        const currentUserRole = res.locals.user.role;
        const currentUserPermissions = res.locals.permissions;
        const { isControlRole } = res.locals.user;
        const { shadowMainUserRole, shadowUserId } = res.locals;

        const transactionList = [];
        let companyHeadId;
        let companyHeadRole;
        if (isControlRole) {
            companyHeadId = shadowUserId;
            companyHeadRole = shadowMainUserRole;
        } else {
            companyHeadId = currentUserId;
            companyHeadRole = currentUserRole;
            if (!currentUserPermissions.has(PERMISSIONS.EXPECT_REGISTRATION_CONFIRMATION)) {
                transactionList.push(
                    UserPermissionsService.addUserPermissionAsTransaction(currentUserId, PERMISSIONS.EXPECT_REGISTRATION_CONFIRMATION)
                );
            }
        }
        const company = await CompaniesService.getCompanyByUserIdStrict(companyHeadId);

        const companyData = {
            ...req.body,
        };

        transactionList.push(
            CompaniesService.updateCompanyAsTransaction(company.id, MAP_ROLES_AND_FORMATTERS_STEP_1[companyHeadRole](companyData))
        );

        await TablesService.runTransaction(transactionList);

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
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
const editStep2 = async (req, res, next) => {
    try {
        const currentUserId = res.locals.user.id;
        const currentUserPermissions = res.locals.permissions;
        const { isControlRole } = res.locals.user;
        const { shadowUserId } = res.locals;
        const { body } = req;

        const transactionList = [];
        let companyHeadId;
        if (isControlRole) {
            companyHeadId = shadowUserId;
        } else {
            companyHeadId = currentUserId;
            if (!currentUserPermissions.has(PERMISSIONS.EXPECT_REGISTRATION_CONFIRMATION)) {
                transactionList.push(
                    UserPermissionsService.addUserPermissionAsTransaction(currentUserId, PERMISSIONS.EXPECT_REGISTRATION_CONFIRMATION)
                );
            }
        }

        const company = await CompaniesService.getCompanyByUserIdStrict(companyHeadId);

        const companyData = formatCompanyDataOnStep2(body);

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
* @req.params {user} - current user
* @req.params {permissions} - current permissions
* @req.params {isControlRole} - is current user admin or manager
* @req.params {shadowMainUserRole} - if control user role is used - role of company admin || from injectShadowCompanyHeadByMeOrId
* @req.params {shadowUserId} - if control user role is used - id of company admin
* */
const editStep3 = async (req, res, next) => {
    try {
        const currentUserId = res.locals.user.id;
        const currentUserRole = res.locals.user.role;
        const currentUserPermissions = res.locals.permissions;
        const { isControlRole } = res.locals.user;
        const { shadowMainUserRole, shadowUserId } = res.locals;

        const transactionList = [];
        let companyHeadId;
        let companyHeadRole;
        if (isControlRole) {
            companyHeadId = shadowUserId;
            companyHeadRole = shadowMainUserRole;
        } else {
            companyHeadId = currentUserId;
            companyHeadRole = currentUserRole;
            if (!currentUserPermissions.has(PERMISSIONS.EXPECT_REGISTRATION_CONFIRMATION)) {
                transactionList.push(
                    UserPermissionsService.addUserPermissionAsTransaction(currentUserId, PERMISSIONS.EXPECT_REGISTRATION_CONFIRMATION)
                );
            }
        }

        res.locals.step3Data = {};
        res.locals.step3Data.transactionList = transactionList;
        res.locals.step3Data.companyHeadId = companyHeadId;
        res.locals.step3Data.companyHeadRole = companyHeadRole;

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
