const { success } = require('api/response');

// services
const CompaniesService = require('services/tables/companies');
const RoutesService = require('services/tables/routes');
const UsersRolesService = require('services/tables/users-to-roles');
const UserPermissionsService = require('services/tables/users-to-permissions');
const TablesService = require('services/tables');

// constants
const {
    ROLES,
    PERMISSIONS,
    MAP_FROM_PENDING_ROLE_TO_MAIN,
} = require('constants/system');
const { SUCCESS_CODES } = require('constants/http-codes');

// formatters
const FinishRegistrationFormatters = require('formatters/finish-registration');
const { formatGeoDataValuesToSave } = require('formatters/geo');
const { formatRoutesToSave } = require('formatters/routes');
const { formatCompanyDataOnStep2 } = require('formatters/companies');

const MAP_ROLES_AND_FORMATTERS_STEP_1 = {
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER]: FinishRegistrationFormatters.formatCompanyForTransporterToSave,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER]: FinishRegistrationFormatters.formatCompanyForHolderToSave,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_INDIVIDUAL_FORWARDER]: FinishRegistrationFormatters.formatCompanyForIndividualForwarderToSave,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER]: FinishRegistrationFormatters.formatCompanyForSoleProprietorForwarderToSave,
};

const MAP_ROLES_TO_NEXT_PERMISSIONS_FOR_STEP_1 = {
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER]: PERMISSIONS.REGISTRATION_SAVE_STEP_2,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER]: PERMISSIONS.REGISTRATION_SAVE_STEP_2,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_INDIVIDUAL_FORWARDER]: PERMISSIONS.REGISTRATION_SAVE_STEP_3,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER]: PERMISSIONS.REGISTRATION_SAVE_STEP_2,
};

const MAP_ROLES_TO_NEXT_PERMISSIONS_FOR_STEP_3 = {
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER]: PERMISSIONS.REGISTRATION_SAVE_STEP_4,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER]: PERMISSIONS.REGISTRATION_SAVE_STEP_5,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_INDIVIDUAL_FORWARDER]: PERMISSIONS.REGISTRATION_SAVE_STEP_5,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER]: PERMISSIONS.REGISTRATION_SAVE_STEP_5,
};

const finishRegistrationStep1 = async (req, res, next) => {
    try {
        const userId = res.locals.user.id;
        const userRole = res.locals.user.role;
        const userPermissions = res.locals.permissions;

        const company = await CompaniesService.getCompanyByUserIdStrict(userId);

        const companyData = {
            ...req.body,
        };

        const transactionsList = [
            CompaniesService.updateCompanyAsTransaction(company.id, MAP_ROLES_AND_FORMATTERS_STEP_1[userRole](companyData)),
        ];

        if (!(userPermissions.has(PERMISSIONS.REGISTRATION_SAVE_STEP_2) || userPermissions.has(PERMISSIONS.REGISTRATION_SAVE_STEP_3))) {
            transactionsList.push(
                UserPermissionsService.addUserPermissionAsTransaction(userId, MAP_ROLES_TO_NEXT_PERMISSIONS_FOR_STEP_1[userRole]),
            );
        }

        await TablesService.runTransaction(transactionsList);

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

const finishRegistrationStep2 = async (req, res, next) => {
    try {
        const { body } = req;
        const userId = res.locals.user.id;
        const userPermissions = res.locals.permissions;

        const company = await CompaniesService.getCompanyByUserIdStrict(userId);

        const companyData = formatCompanyDataOnStep2(body);

        const transactionList = [
            CompaniesService.updateCompanyAsTransaction(company.id, companyData),
        ];

        if (!userPermissions.has(PERMISSIONS.REGISTRATION_SAVE_STEP_3)) {
            transactionList.push(UserPermissionsService.addUserPermissionAsTransaction(userId, PERMISSIONS.REGISTRATION_SAVE_STEP_3));
        }
        await TablesService.runTransaction(transactionList);

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

const finishRegistrationStep3 = async (req, res, next) => {
    try {
        const userId = res.locals.user.id;
        const userRole = res.locals.user.role;
        const userPermissions = res.locals.permissions;

        const transactionsList = [];

        if (!(userPermissions.has(PERMISSIONS.REGISTRATION_SAVE_STEP_4) || userPermissions.has(PERMISSIONS.REGISTRATION_SAVE_STEP_5))) {
            // first time here
            transactionsList.push(
                UserPermissionsService.addUserPermissionAsTransaction(userId, MAP_ROLES_TO_NEXT_PERMISSIONS_FOR_STEP_3[userRole]),
            );
        }

        res.locals.step3Data = {};
        res.locals.step3Data.transactionList = transactionsList;

        return next();
    } catch (error) {
        next(error);
    }
};

const finishRegistrationStep4 = async (req, res, next) => {
    try {
        const userId = res.locals.user.id;
        const userPermissions = res.locals.permissions;
        const { body } = req;
        const coordinates = formatGeoDataValuesToSave(body.routes);

        const company = await CompaniesService.getCompanyByUserIdStrict(userId);

        const routes = formatRoutesToSave(coordinates, company.id);

        const transactionsList = [];
        if (userPermissions.has(PERMISSIONS.REGISTRATION_SAVE_STEP_5)) {
            // update
            transactionsList.push(RoutesService.removeRecordsByCompanyIdAsTransaction(company.id));
        } else {
            // insert
            transactionsList.push(UserPermissionsService.addUserPermissionAsTransaction(userId, PERMISSIONS.REGISTRATION_SAVE_STEP_5));
        }

        transactionsList.push(RoutesService.addRecordsAsTransaction(routes));

        await TablesService.runTransaction(transactionsList);

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

const finishRegistrationStep5 = async (req, res, next) => {
    try {
        const userId = res.locals.user.id;
        const userRole = res.locals.user.role;
        const permissionsToRemove = [
            PERMISSIONS.REGISTRATION_SAVE_STEP_1,
            PERMISSIONS.REGISTRATION_SAVE_STEP_2,
            PERMISSIONS.REGISTRATION_SAVE_STEP_3,
            PERMISSIONS.REGISTRATION_SAVE_STEP_4,
            PERMISSIONS.REGISTRATION_SAVE_STEP_5,
        ];

        const nextUserRole = MAP_FROM_PENDING_ROLE_TO_MAIN[userRole];

        const transactionsList = [
            UserPermissionsService.removeUserPermissionsAsTransaction(userId, permissionsToRemove),
        ];

        if ([ROLES.TRANSPORTER, ROLES.HOLDER].includes(nextUserRole)) {
            transactionsList.push(
                UsersRolesService.updateUserRoleAsTransaction(userId, nextUserRole)
            );
        }

        await TablesService.runTransaction(transactionsList);

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    finishRegistrationStep1,
    finishRegistrationStep2,
    finishRegistrationStep3,
    finishRegistrationStep4,
    finishRegistrationStep5,
};
