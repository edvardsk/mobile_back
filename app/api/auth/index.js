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
const ValidatorSchemes = require('helpers/validators/schemes');

// middlewares
const { isHasPermissions, isAuthenticated } = require('api/middlewares');
const { formDataHandler } = require('api/middlewares/files');
const { validate } = require('api/middlewares/validator');

const upload = multer();
const router = express.Router();

const FINISH_REGISTRATION_STEP1_PERMISSIONS = [
    PERMISSIONS.FINISH_REGISTRATION,
    PERMISSIONS.REGISTRATION_SAVE_STEP_1,
];

const CONFIRM_PHONE_NUMBER_PERMISSIONS = [
    PERMISSIONS.CONFIRM_PHONE_NUMBER,
];

const FINISH_REGISTRATION_STEP_1_TEXT_MAP_SCHEMES = {
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER]: ValidatorSchemes.finishRegistrationStep1Transporter,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER]: ValidatorSchemes.finishRegistrationStep1Holder,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_FORWARDER]: ValidatorSchemes.finishRegistrationStep1Forwarder,
};

// const FINISH_REGISTRATION_STEP_1_FILES_MAP_SCHEMES = {
//     [ROLES.CONFIRMED_EMAIL_TRANSPORTER]: ValidatorSchemes.companyFilesTransporter,
//     [ROLES.CONFIRMED_EMAIL_HOLDER]: ValidatorSchemes.companyFilesHolder,
//     [ROLES.CONFIRMED_EMAIL_FORWARDER]: ValidatorSchemes.companyFilesForwarder,
// };

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
    registration.createUser);

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
router.post(ROUTES.AUTH.CONFIRM_EMAIL.BASE + ROUTES.AUTH.CONFIRM_EMAIL.GET, emailConfirmation.confirmEmail);


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
    // formDataHandler(uploadData), // uploading files middleware
    validate(({ role }) => FINISH_REGISTRATION_STEP_1_TEXT_MAP_SCHEMES[role]),
    // validate(({ role }) => FINISH_REGISTRATION_STEP_1_FILES_MAP_SCHEMES[role], 'files'),
    finishRegistration.finishRegistrationStep1,
);

module.exports = router;
