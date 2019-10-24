const express = require('express');
const multer  = require('multer');

// routes
const authorization = require('./authorization');
const registration = require('./registration');
const emailConfirmation = require('./email-confirmation');
const forgotPassword = require('./forgot-password');
const finishRegistration = require('./finish-registration');
const phoneConfirmation = require('./phone-confirmation');

// constants
const { ROUTES } = require('constants/routes');
const { PERMISSIONS, ROLES } = require('constants/system');
const { HOMELESS_COLUMNS } = require('constants/tables');

// helpers
const ValidatorSchemes = require('helpers/validators/schemes');

// middlewares
const { isHasPermissions, isAuthenticated } = require('api/middlewares');
const { formDataHandler } = require('api/middlewares/files');
const { validate, validateMultipartJSONProp } = require('api/middlewares/validator');

const upload = multer();

const router = express.Router();

const FINISH_REGISTRATION_STEP1_PERMISSIONS = [
    PERMISSIONS.FINISH_REGISTRATION,
    PERMISSIONS.REGISTRATION_SAVE_STEP_1,
];

const FINISH_REGISTRATION_STEP2_PERMISSIONS = [
    PERMISSIONS.FINISH_REGISTRATION,
    PERMISSIONS.REGISTRATION_SAVE_STEP_2,
];

const FINISH_REGISTRATION_STEP3_PERMISSIONS = [
    PERMISSIONS.FINISH_REGISTRATION,
    PERMISSIONS.REGISTRATION_SAVE_STEP_3,
];

const FINISH_REGISTRATION_STEP4_PERMISSIONS = [
    PERMISSIONS.FINISH_REGISTRATION,
    PERMISSIONS.REGISTRATION_SAVE_STEP_4,
];

const FINISH_REGISTRATION_STEP5_PERMISSIONS = [
    PERMISSIONS.FINISH_REGISTRATION,
    PERMISSIONS.REGISTRATION_SAVE_STEP_5,
];

const CONFIRM_PHONE_NUMBER_PERMISSIONS = [
    PERMISSIONS.CONFIRM_PHONE_NUMBER,
];

const FINISH_REGISTRATION_STEP_1_TEXT_MAP_SCHEMES = {
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER]: ValidatorSchemes.finishRegistrationStep1Transporter,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER]: ValidatorSchemes.finishRegistrationStep1Holder,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_INDIVIDUAL_FORWARDER]: ValidatorSchemes.finishRegistrationStep1IndividualForwarder,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER]: ValidatorSchemes.finishRegistrationStep1SoleProprietorForwarder,
};

const FINISH_REGISTRATION_STEP_1_TEXT_MAP_SCHEMES_ASYNC = {
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER]: ValidatorSchemes.finishRegistrationStep1TransporterAsyncFunc,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER]: ValidatorSchemes.finishRegistrationStep1HolderAsyncFunc,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_INDIVIDUAL_FORWARDER]: ValidatorSchemes.finishRegistrationStep1IndividualForwarderAsyncFunc,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER]: ValidatorSchemes.finishRegistrationStep1SoleProprietorForwarderAsyncFunc,
};

const FINISH_REGISTRATION_STEP_2_TEXT_MAP_SCHEMES = {
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER]: ValidatorSchemes.finishRegistrationStep2Transporter,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER]: ValidatorSchemes.finishRegistrationStep2Holder,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER]: ValidatorSchemes.finishRegistrationStep2SoleProprietorForwarder,
};

const FINISH_REGISTRATION_STEP_2_TEXT_MAP_SCHEMES_ASYNC = {
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER]: ValidatorSchemes.finishRegistrationStep2TransporterAsyncFunc,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER]: ValidatorSchemes.finishRegistrationStep2HolderAsyncFunc,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER]: ValidatorSchemes.finishRegistrationStep2SoleProprietorForwarderAsyncFunc,
};

const FINISH_REGISTRATION_STEP_3_TEXT_MAP_SCHEMES = {
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER]: ValidatorSchemes.finishRegistrationStep3Transporter,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER]: ValidatorSchemes.finishRegistrationStep3Holder,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_INDIVIDUAL_FORWARDER]: ValidatorSchemes.finishRegistrationStep3IndividualForwarder,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER]: ValidatorSchemes.finishRegistrationStep3SoleProprietorForwarder,
};

const FINISH_REGISTRATION_STEP_3_TEXT_MAP_SCHEMES_ASYNC = {
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER]: ValidatorSchemes.finishRegistrationStep3TransporterAsyncFunc,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER]: ValidatorSchemes.finishRegistrationStep3HolderAsyncFunc,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_INDIVIDUAL_FORWARDER]: ValidatorSchemes.finishRegistrationStep3IndividualForwarderAsyncFunc,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER]: ValidatorSchemes.finishRegistrationStep3SoleProprietorForwarderAsyncFunc,
};

const FINISH_REGISTRATION_STEP_3_FILES_MAP_SCHEMES = {
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER]: ValidatorSchemes.finishRegistrationStep3TransporterFiles,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER]: ValidatorSchemes.finishRegistrationStep3HolderFiles,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_INDIVIDUAL_FORWARDER]: ValidatorSchemes.finishRegistrationStep3IndividualForwarderFiles,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER]: ValidatorSchemes.finishRegistrationStep3SoleProprietorForwarderFiles,
};

const uploadData = upload.any();

router.use('/*', isAuthenticated);

// registration/authorization
router.post(
    ROUTES.AUTH.AUTHORIZATION.BASE + ROUTES.AUTH.AUTHORIZATION.POST,
    validate(ValidatorSchemes.authorization),
    authorization.createToken
);

router.post(
    ROUTES.AUTH.REGISTRATION.BASE + ROUTES.AUTH.REGISTRATION.POST,
    validate(ValidatorSchemes.registration),
    validate(ValidatorSchemes.registrationAsync),
    validate(ValidatorSchemes.phoneNumberWithPrefixAsync),
    registration.createUser
);

router.get(
    ROUTES.AUTH.REGISTRATION.BASE + ROUTES.AUTH.REGISTRATION.ROLES.BASE + ROUTES.AUTH.REGISTRATION.ROLES.GET,
    registration.getRoles
);

router.get(
    ROUTES.AUTH.REGISTRATION.BASE + ROUTES.AUTH.REGISTRATION.PHONE_PREFIXES.BASE + ROUTES.AUTH.REGISTRATION.PHONE_PREFIXES.GET,
    registration.getPhonePrefixes
);

router.get(
    ROUTES.AUTH.REGISTRATION.BASE + ROUTES.AUTH.REGISTRATION.COUNTRIES.BASE + ROUTES.AUTH.REGISTRATION.COUNTRIES.GET,
    registration.getCountries
);


// confirm email
router.post(ROUTES.AUTH.CONFIRM_EMAIL.BASE + ROUTES.AUTH.CONFIRM_EMAIL.POST, emailConfirmation.confirmEmail);

router.post(
    ROUTES.AUTH.CONFIRM_EMAIL.BASE + ROUTES.AUTH.CONFIRM_EMAIL.ADVANCED.BASE + ROUTES.AUTH.CONFIRM_EMAIL.ADVANCED.POST,
    validate(ValidatorSchemes.requiredPassword),
    emailConfirmation.advancedConfirmEmail
);


// forgot password
router.post(
    ROUTES.AUTH.FORGOT_PASSWORD.BASE + ROUTES.AUTH.FORGOT_PASSWORD.RESET.BASE + ROUTES.AUTH.FORGOT_PASSWORD.RESET.POST,
    forgotPassword.resetPassword
);

router.post(
    ROUTES.AUTH.FORGOT_PASSWORD.BASE + ROUTES.AUTH.FORGOT_PASSWORD.CHANGE.BASE + ROUTES.AUTH.FORGOT_PASSWORD.CHANGE.POST,
    forgotPassword.changePassword,
);


// confirm phone number
router.post(
    ROUTES.AUTH.PHONE_NUMBERS.BASE + ROUTES.AUTH.PHONE_NUMBERS.SEND_CODE.BASE + ROUTES.AUTH.PHONE_NUMBERS.SEND_CODE.POST,
    isHasPermissions(CONFIRM_PHONE_NUMBER_PERMISSIONS),
    phoneConfirmation.sendCode,
);

router.post(
    ROUTES.AUTH.PHONE_NUMBERS.BASE + ROUTES.AUTH.PHONE_NUMBERS.CONFIRM_PHONE.BASE + ROUTES.AUTH.PHONE_NUMBERS.CONFIRM_PHONE.POST,
    isHasPermissions(CONFIRM_PHONE_NUMBER_PERMISSIONS),
    validate(ValidatorSchemes.confirmPhoneNumber),
    phoneConfirmation.confirmPhone,
);


// finish registration
router.post(
    ROUTES.AUTH.FINISH_REGISTRATION.BASE + ROUTES.AUTH.FINISH_REGISTRATION.STEPS.BASE + ROUTES.AUTH.FINISH_REGISTRATION.STEPS['1'].BASE + ROUTES.AUTH.FINISH_REGISTRATION.STEPS['1'].POST,
    isHasPermissions(FINISH_REGISTRATION_STEP1_PERMISSIONS), // permissions middleware
    validate(({ role }) => FINISH_REGISTRATION_STEP_1_TEXT_MAP_SCHEMES[role]),
    validate(({ role, userId }) => FINISH_REGISTRATION_STEP_1_TEXT_MAP_SCHEMES_ASYNC[role](userId)),
    finishRegistration.finishRegistrationStep1,
);

router.post(
    ROUTES.AUTH.FINISH_REGISTRATION.BASE + ROUTES.AUTH.FINISH_REGISTRATION.STEPS.BASE + ROUTES.AUTH.FINISH_REGISTRATION.STEPS['2'].BASE + ROUTES.AUTH.FINISH_REGISTRATION.STEPS['2'].POST,
    isHasPermissions(FINISH_REGISTRATION_STEP2_PERMISSIONS), // permissions middleware
    validate(({ role }) => FINISH_REGISTRATION_STEP_2_TEXT_MAP_SCHEMES[role]),
    validate(({ role, userId }) => FINISH_REGISTRATION_STEP_2_TEXT_MAP_SCHEMES_ASYNC[role](userId)),
    finishRegistration.finishRegistrationStep2,
);

router.post(
    ROUTES.AUTH.FINISH_REGISTRATION.BASE + ROUTES.AUTH.FINISH_REGISTRATION.STEPS.BASE + ROUTES.AUTH.FINISH_REGISTRATION.STEPS['3'].BASE + ROUTES.AUTH.FINISH_REGISTRATION.STEPS['3'].POST,
    isHasPermissions(FINISH_REGISTRATION_STEP3_PERMISSIONS), // permissions middleware
    formDataHandler(uploadData), // uploading files middleware
    validate(({ role }) => FINISH_REGISTRATION_STEP_3_TEXT_MAP_SCHEMES[role]),
    validate(({ role, userId }) => FINISH_REGISTRATION_STEP_3_TEXT_MAP_SCHEMES_ASYNC[role](userId)),
    validateMultipartJSONProp(ValidatorSchemes.otherOrganizations, `body.${HOMELESS_COLUMNS.OTHER_ORGANIZATIONS}`),
    validate(({ role }) => FINISH_REGISTRATION_STEP_3_FILES_MAP_SCHEMES[role], 'files'),
    finishRegistration.finishRegistrationStep3,
);

router.post(
    ROUTES.AUTH.FINISH_REGISTRATION.BASE + ROUTES.AUTH.FINISH_REGISTRATION.STEPS.BASE + ROUTES.AUTH.FINISH_REGISTRATION.STEPS['4'].BASE + ROUTES.AUTH.FINISH_REGISTRATION.STEPS['4'].POST,
    isHasPermissions(FINISH_REGISTRATION_STEP4_PERMISSIONS), // permissions middleware
    validate(ValidatorSchemes.finishRegistrationStep4),
    finishRegistration.finishRegistrationStep4,
);

router.post(
    ROUTES.AUTH.FINISH_REGISTRATION.BASE + ROUTES.AUTH.FINISH_REGISTRATION.STEPS.BASE + ROUTES.AUTH.FINISH_REGISTRATION.STEPS['5'].BASE + ROUTES.AUTH.FINISH_REGISTRATION.STEPS['5'].POST,
    isHasPermissions(FINISH_REGISTRATION_STEP5_PERMISSIONS), // permissions middleware
    finishRegistration.finishRegistrationStep5,
);

module.exports = router;
