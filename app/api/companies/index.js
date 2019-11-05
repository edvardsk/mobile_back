const express = require('express');
const multer  = require('multer');
const { ROUTES } = require('constants/routes');
const getEmployees = require('./employees/get');
const get = require('./get');
const getData = require('./data/get');
const getFiles = require('./files/get');
const postSteps = require('./steps/post');
const getSteps = require('./steps/get');

// middlewares
const { isHasPermissions, injectShadowCompanyHeadByMeOrId } = require('api/middlewares');
const { validate } = require('api/middlewares/validator');
const { formDataHandler, createOrUpdateDataOnStep3 } = require('api/middlewares/files');

// constants
const { PERMISSIONS, ROLES } = require('constants/system');

// helpers
const ValidatorSchemes = require('helpers/validators/schemes');

const router = express.Router();
const upload = multer();
const uploadData = upload.any();

const CREATE_OR_MODIFY_STEP_1_TEXT_MAP_SCHEMES = {
    [ROLES.TRANSPORTER]: ValidatorSchemes.finishRegistrationStep1Transporter,
    [ROLES.HOLDER]: ValidatorSchemes.finishRegistrationStep1Holder,
    [ROLES.INDIVIDUAL_FORWARDER]: ValidatorSchemes.finishRegistrationStep1IndividualForwarder,
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: ValidatorSchemes.finishRegistrationStep1SoleProprietorForwarder,
};

const CREATE_OR_MODIFY_STEP_1_TEXT_MAP_SCHEMES_ASYNC = {
    [ROLES.TRANSPORTER]: ValidatorSchemes.finishRegistrationStep1TransporterAsyncFunc,
    [ROLES.HOLDER]: ValidatorSchemes.finishRegistrationStep1HolderAsyncFunc,
    [ROLES.INDIVIDUAL_FORWARDER]: ValidatorSchemes.finishRegistrationStep1IndividualForwarderAsyncFunc,
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: ValidatorSchemes.finishRegistrationStep1SoleProprietorForwarderAsyncFunc,
};

const CREATE_OR_MODIFY_STEP_2_TEXT_MAP_SCHEMES = {
    [ROLES.TRANSPORTER]: ValidatorSchemes.finishRegistrationStep2Transporter,
    [ROLES.HOLDER]: ValidatorSchemes.finishRegistrationStep2Holder,
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: ValidatorSchemes.finishRegistrationStep2SoleProprietorForwarder,
};

const CREATE_OR_MODIFY_STEP_2_TEXT_MAP_SCHEMES_ASYNC = {
    [ROLES.TRANSPORTER]: ValidatorSchemes.finishRegistrationStep2TransporterAsyncFunc,
    [ROLES.HOLDER]: ValidatorSchemes.finishRegistrationStep2HolderAsyncFunc,
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: ValidatorSchemes.finishRegistrationStep2SoleProprietorForwarderAsyncFunc,
};

const CREATE_OR_MODIFY_STEP_3_TEXT_MAP_SCHEMES = {
    [ROLES.TRANSPORTER]: ValidatorSchemes.finishRegistrationStep3Transporter,
    [ROLES.HOLDER]: ValidatorSchemes.finishRegistrationStep3Holder,
    [ROLES.INDIVIDUAL_FORWARDER]: ValidatorSchemes.finishRegistrationStep3IndividualForwarder,
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: ValidatorSchemes.finishRegistrationStep3SoleProprietorForwarder,
};

const CREATE_OR_MODIFY_STEP_3_TEXT_MAP_SCHEMES_ASYNC = {
    [ROLES.TRANSPORTER]: ValidatorSchemes.finishRegistrationStep3TransporterAsyncFunc,
    [ROLES.HOLDER]: ValidatorSchemes.finishRegistrationStep3HolderAsyncFunc,
    [ROLES.INDIVIDUAL_FORWARDER]: ValidatorSchemes.finishRegistrationStep3IndividualForwarderAsyncFunc,
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: ValidatorSchemes.finishRegistrationStep3SoleProprietorForwarderAsyncFunc,
};

const CREATE_OR_MODIFY_STEP_3_FILES_MAP_SCHEMES = {
    [ROLES.TRANSPORTER]: ValidatorSchemes.finishRegistrationStep3TransporterFiles,
    [ROLES.HOLDER]: ValidatorSchemes.finishRegistrationStep3HolderFiles,
    [ROLES.INDIVIDUAL_FORWARDER]: ValidatorSchemes.finishRegistrationStep3IndividualForwarderFiles,
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: ValidatorSchemes.finishRegistrationStep3SoleProprietorForwarderFiles,
};

// employees
router.get(
    ROUTES.COMPANIES.EMPLOYEES.BASE + ROUTES.COMPANIES.EMPLOYEES.GET_ALL,
    isHasPermissions([PERMISSIONS.READ_EMPLOYEES]),
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    validate(ValidatorSchemes.basePaginationQuery, 'query'),
    validate(ValidatorSchemes.basePaginationModifyQuery, 'query'),
    validate(ValidatorSchemes.baseSortingSortingDirectionQuery, 'query'),
    validate(ValidatorSchemes.companyEmployeesSortColumnQuery, 'query'),
    validate(ValidatorSchemes.modifyFilterQuery, 'query'),
    validate(ValidatorSchemes.companyEmployeesFilterQuery, 'query'),
    getEmployees.getListEmployees,
);

router.get(
    ROUTES.COMPANIES.EMPLOYEES.BASE + ROUTES.COMPANIES.EMPLOYEES.ROLES.BASE + ROUTES.COMPANIES.EMPLOYEES.ROLES.GET,
    isHasPermissions([PERMISSIONS.READ_EMPLOYEES]),
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    validate(ValidatorSchemes.basePaginationQuery, 'query'),
    validate(ValidatorSchemes.basePaginationModifyQuery, 'query'),
    validate(ValidatorSchemes.modifyFilterQuery, 'query'),
    validate(ValidatorSchemes.companyDriversFilterQuery, 'query'),
    getEmployees.getListDrivers,
);


// data
router.get(
    ROUTES.COMPANIES.GET,
    isHasPermissions([PERMISSIONS.READ_LEGAL_DATA]),
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectShadowCompanyHeadByMeOrId,
    get.geCommonData,
);

router.get(
    ROUTES.COMPANIES.LEGAL_DATA.BASE + ROUTES.COMPANIES.LEGAL_DATA.GET,
    isHasPermissions([PERMISSIONS.READ_LEGAL_DATA]),
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectShadowCompanyHeadByMeOrId,
    getData.getLegalData,
);

router.get(
    ROUTES.COMPANIES.FILES.BASE + ROUTES.COMPANIES.FILES.GROUPS.BASE + ROUTES.COMPANIES.FILES.GROUPS.GET,
    isHasPermissions([PERMISSIONS.READ_LEGAL_DATA]),
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    validate(ValidatorSchemes.listFilesGroupParams, 'params'),
    injectShadowCompanyHeadByMeOrId,
    getFiles.getGroupFiles,
);


// modify company steps
router.post(
    ROUTES.COMPANIES.STEPS.BASE + ROUTES.COMPANIES.STEPS['1'].BASE + ROUTES.COMPANIES.STEPS['1'].POST,
    isHasPermissions([PERMISSIONS.MODIFY_COMPANY_DATA_STEP_1]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectShadowCompanyHeadByMeOrId,
    validate(({ shadowMainUserRole, role }) => CREATE_OR_MODIFY_STEP_1_TEXT_MAP_SCHEMES[shadowMainUserRole || role]),
    validate(({ shadowUserId, shadowMainUserRole, role, userId }) => (
        CREATE_OR_MODIFY_STEP_1_TEXT_MAP_SCHEMES_ASYNC[shadowMainUserRole || role](shadowUserId || userId)
    )),
    postSteps.editStep1,
);

router.post(
    ROUTES.COMPANIES.STEPS.BASE + ROUTES.COMPANIES.STEPS['2'].BASE + ROUTES.COMPANIES.STEPS['2'].POST,
    isHasPermissions([PERMISSIONS.MODIFY_COMPANY_DATA_STEP_2]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectShadowCompanyHeadByMeOrId,
    validate(({ shadowMainUserRole, role }) => CREATE_OR_MODIFY_STEP_2_TEXT_MAP_SCHEMES[shadowMainUserRole || role]),
    validate(({ shadowUserId, shadowMainUserRole, role, userId }) => (
        CREATE_OR_MODIFY_STEP_2_TEXT_MAP_SCHEMES_ASYNC[shadowMainUserRole || role](shadowUserId || userId)
    )),
    validate(ValidatorSchemes.settlementAccountAsync),
    postSteps.editStep2,
);

router.post(
    ROUTES.COMPANIES.STEPS.BASE + ROUTES.COMPANIES.STEPS['3'].BASE + ROUTES.COMPANIES.STEPS['3'].POST,
    isHasPermissions([PERMISSIONS.MODIFY_COMPANY_DATA_STEP_3]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectShadowCompanyHeadByMeOrId,
    formDataHandler(uploadData), // uploading files middleware
    validate(ValidatorSchemes.modifyOtherOrganizations),
    validate(({ shadowMainUserRole, role }) => CREATE_OR_MODIFY_STEP_3_TEXT_MAP_SCHEMES[shadowMainUserRole || role]),
    validate(({ shadowUserId, shadowMainUserRole, role, userId }) => (
        CREATE_OR_MODIFY_STEP_3_TEXT_MAP_SCHEMES_ASYNC[shadowMainUserRole || role](shadowUserId || userId)
    )),
    validate(({ shadowMainUserRole, role }) => CREATE_OR_MODIFY_STEP_3_FILES_MAP_SCHEMES[shadowMainUserRole || role], 'files'),
    postSteps.editStep3,
    createOrUpdateDataOnStep3,
);


// get company data steps
router.get(
    ROUTES.COMPANIES.STEPS.BASE + ROUTES.COMPANIES.STEPS['1'].BASE + ROUTES.COMPANIES.STEPS['1'].GET,
    isHasPermissions([PERMISSIONS.MODIFY_COMPANY_DATA_STEP_1]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectShadowCompanyHeadByMeOrId,
    getSteps.getStep1,
);

router.get(
    ROUTES.COMPANIES.STEPS.BASE + ROUTES.COMPANIES.STEPS['2'].BASE + ROUTES.COMPANIES.STEPS['2'].GET,
    isHasPermissions([PERMISSIONS.MODIFY_COMPANY_DATA_STEP_2]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectShadowCompanyHeadByMeOrId,
    getSteps.getStep2,
);

router.get(
    ROUTES.COMPANIES.STEPS.BASE + ROUTES.COMPANIES.STEPS['3'].BASE + ROUTES.COMPANIES.STEPS['3'].GET,
    isHasPermissions([PERMISSIONS.MODIFY_COMPANY_DATA_STEP_3]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectShadowCompanyHeadByMeOrId,
    getSteps.getStep3,
);

module.exports = router;
