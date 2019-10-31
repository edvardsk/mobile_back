const express = require('express');
const multer  = require('multer');
const { ROUTES } = require('constants/routes');
const getEmployees = require('./employees/get');
const get = require('./get');
const getData = require('./data/get');
const getFiles = require('./files/get');
const postSteps = require('./steps/post');

// middlewares
const { isHasPermissions } = require('api/middlewares');
const { validate } = require('api/middlewares/validator');
const { formDataHandler } = require('api/middlewares/files');

// constants
const { PERMISSIONS, ROLES } = require('constants/system');

// helpers
const ValidatorSchemes = require('helpers/validators/schemes');

const router = express.Router();
const upload = multer();
const uploadData = upload.any();

const CREATE_OR_MODIFY_STEP_1_TEXT_MAP_SCHEMES = {
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER]: ValidatorSchemes.finishRegistrationStep1Transporter,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER]: ValidatorSchemes.finishRegistrationStep1Holder,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_INDIVIDUAL_FORWARDER]: ValidatorSchemes.finishRegistrationStep1IndividualForwarder,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER]: ValidatorSchemes.finishRegistrationStep1SoleProprietorForwarder,
};

const CREATE_OR_MODIFY_STEP_1_TEXT_MAP_SCHEMES_ASYNC = {
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER]: ValidatorSchemes.finishRegistrationStep1TransporterAsyncFunc,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER]: ValidatorSchemes.finishRegistrationStep1HolderAsyncFunc,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_INDIVIDUAL_FORWARDER]: ValidatorSchemes.finishRegistrationStep1IndividualForwarderAsyncFunc,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER]: ValidatorSchemes.finishRegistrationStep1SoleProprietorForwarderAsyncFunc,
};

const CREATE_OR_MODIFY_STEP_2_TEXT_MAP_SCHEMES = {
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER]: ValidatorSchemes.finishRegistrationStep2Transporter,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER]: ValidatorSchemes.finishRegistrationStep2Holder,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER]: ValidatorSchemes.finishRegistrationStep2SoleProprietorForwarder,
};

const CREATE_OR_MODIFY_STEP_2_TEXT_MAP_SCHEMES_ASYNC = {
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER]: ValidatorSchemes.finishRegistrationStep2TransporterAsyncFunc,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER]: ValidatorSchemes.finishRegistrationStep2HolderAsyncFunc,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER]: ValidatorSchemes.finishRegistrationStep2SoleProprietorForwarderAsyncFunc,
};

const CREATE_OR_MODIFY_STEP_3_TEXT_MAP_SCHEMES = {
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER]: ValidatorSchemes.finishRegistrationStep3Transporter,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER]: ValidatorSchemes.finishRegistrationStep3Holder,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_INDIVIDUAL_FORWARDER]: ValidatorSchemes.finishRegistrationStep3IndividualForwarder,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER]: ValidatorSchemes.finishRegistrationStep3SoleProprietorForwarder,
};

const CREATE_OR_MODIFY_STEP_3_TEXT_MAP_SCHEMES_ASYNC = {
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER]: ValidatorSchemes.finishRegistrationStep3TransporterAsyncFunc,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER]: ValidatorSchemes.finishRegistrationStep3HolderAsyncFunc,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_INDIVIDUAL_FORWARDER]: ValidatorSchemes.finishRegistrationStep3IndividualForwarderAsyncFunc,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER]: ValidatorSchemes.finishRegistrationStep3SoleProprietorForwarderAsyncFunc,
};

const CREATE_OR_MODIFY_STEP_3_FILES_MAP_SCHEMES = {
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER]: ValidatorSchemes.finishRegistrationStep3TransporterFiles,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER]: ValidatorSchemes.finishRegistrationStep3HolderFiles,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_INDIVIDUAL_FORWARDER]: ValidatorSchemes.finishRegistrationStep3IndividualForwarderFiles,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER]: ValidatorSchemes.finishRegistrationStep3SoleProprietorForwarderFiles,
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
    validate(ValidatorSchemes.modifyCompanyEmployeesFilterQuery, 'query'),
    validate(ValidatorSchemes.companyEmployeesFilterQuery, 'query'),
    getEmployees.getListEmployees,
);


// data
router.get(
    ROUTES.COMPANIES.GET,
    isHasPermissions([PERMISSIONS.READ_LEGAL_DATA]),
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    get.geCommonData,
);

router.get(
    ROUTES.COMPANIES.LEGAL_DATA.BASE + ROUTES.COMPANIES.LEGAL_DATA.GET,
    isHasPermissions([PERMISSIONS.READ_LEGAL_DATA]),
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    getData.getLegalData,
);

router.get(
    ROUTES.COMPANIES.FILES.BASE + ROUTES.COMPANIES.FILES.GROUPS.BASE + ROUTES.COMPANIES.FILES.GROUPS.GET,
    isHasPermissions([PERMISSIONS.READ_LEGAL_DATA]),
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    validate(ValidatorSchemes.listFilesGroupParams, 'params'),
    getFiles.getGroupFiles,
);


// modify company steps
router.post(
    ROUTES.AUTH.FINISH_REGISTRATION.BASE + ROUTES.AUTH.FINISH_REGISTRATION.STEPS.BASE + ROUTES.AUTH.FINISH_REGISTRATION.STEPS['1'].BASE + ROUTES.AUTH.FINISH_REGISTRATION.STEPS['1'].POST,
    isHasPermissions([PERMISSIONS.MODIFY_COMPANY_DATA_STEP_1]), // permissions middleware
    validate(({ role }) => CREATE_OR_MODIFY_STEP_1_TEXT_MAP_SCHEMES[role]),
    validate(({ role, userId }) => CREATE_OR_MODIFY_STEP_1_TEXT_MAP_SCHEMES_ASYNC[role](userId)),
    postSteps.editStep1,
);

router.post(
    ROUTES.AUTH.FINISH_REGISTRATION.BASE + ROUTES.AUTH.FINISH_REGISTRATION.STEPS.BASE + ROUTES.AUTH.FINISH_REGISTRATION.STEPS['2'].BASE + ROUTES.AUTH.FINISH_REGISTRATION.STEPS['2'].POST,
    isHasPermissions([PERMISSIONS.MODIFY_COMPANY_DATA_STEP_2]), // permissions middleware
    validate(({ role }) => CREATE_OR_MODIFY_STEP_2_TEXT_MAP_SCHEMES[role]),
    validate(({ role, userId }) => CREATE_OR_MODIFY_STEP_2_TEXT_MAP_SCHEMES_ASYNC[role](userId)),
    validate(ValidatorSchemes.settlementAccountAsync),
    postSteps.editStep2,
);

router.post(
    ROUTES.AUTH.FINISH_REGISTRATION.BASE + ROUTES.AUTH.FINISH_REGISTRATION.STEPS.BASE + ROUTES.AUTH.FINISH_REGISTRATION.STEPS['3'].BASE + ROUTES.AUTH.FINISH_REGISTRATION.STEPS['3'].POST,
    isHasPermissions([PERMISSIONS.MODIFY_COMPANY_DATA_STEP_3]), // permissions middleware
    formDataHandler(uploadData), // uploading files middleware
    validate(ValidatorSchemes.modifyOtherOrganizations),
    validate(({ role }) => CREATE_OR_MODIFY_STEP_3_TEXT_MAP_SCHEMES[role]),
    validate(({ role, userId }) => CREATE_OR_MODIFY_STEP_3_TEXT_MAP_SCHEMES_ASYNC[role](userId)),
    validate(({ role }) => CREATE_OR_MODIFY_STEP_3_FILES_MAP_SCHEMES[role], 'files'),
    postSteps.editStep3,
);

module.exports = router;
