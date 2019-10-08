const express = require('express');
const multer  = require('multer');

// routes
const authorization = require('./authorization');
const registration = require('./registration');
const emailConfirmation = require('./email-confirmation');
const forgotPassword = require('./forgot-password');
const finishRegistration = require('./finish-registration');

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

const FINISH_REGISTRATION_PERMISSIONS = [
    PERMISSIONS.FINISH_REGISTRATION,
];

const FINISH_REGISTRATION_TEXT_MAP_SCHEMES = {
    [ROLES.CONFIRMED_PENDING_ROLE1]: ValidatorSchemes.companyFieldsRole1,
    [ROLES.CONFIRMED_PENDING_ROLE2]: ValidatorSchemes.companyFieldsRole2,
    [ROLES.CONFIRMED_PENDING_ROLE3]: ValidatorSchemes.companyFieldsRole3,
};

const FINISH_REGISTRATION_FILES_MAP_SCHEMES = {
    [ROLES.CONFIRMED_PENDING_ROLE1]: ValidatorSchemes.companyFilesRole1,
    [ROLES.CONFIRMED_PENDING_ROLE2]: ValidatorSchemes.companyFilesRole2,
    [ROLES.CONFIRMED_PENDING_ROLE3]: ValidatorSchemes.companyFilesRole3,
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
    registration.createUser);

router.get(
    ROUTES.AUTH.REGISTRATION.BASE + ROUTES.AUTH.REGISTRATION.ROLES.BASE + ROUTES.AUTH.REGISTRATION.ROLES.GET,
    registration.getRoles
);


// confirm password
router.get(ROUTES.AUTH.CONFIRM_EMAIL.BASE + ROUTES.AUTH.CONFIRM_EMAIL.GET, emailConfirmation.confirmEmail);


// forgot password
router.post(
    ROUTES.AUTH.FORGOT_PASSWORD.BASE + ROUTES.AUTH.FORGOT_PASSWORD.RESET.BASE + ROUTES.AUTH.FORGOT_PASSWORD.RESET.POST,
    forgotPassword.resetPassword
);

router.post(
    ROUTES.AUTH.FORGOT_PASSWORD.BASE + ROUTES.AUTH.FORGOT_PASSWORD.CHANGE.BASE + ROUTES.AUTH.FORGOT_PASSWORD.CHANGE.POST,
    forgotPassword.changePassword,
);


// finish registration
router.post(
    ROUTES.AUTH.FINISH_REGISTRATION.BASE,
    isHasPermissions(FINISH_REGISTRATION_PERMISSIONS), // permissions middleware
    formDataHandler(uploadData), // uploading files middleware
    validate(({ role }) => FINISH_REGISTRATION_TEXT_MAP_SCHEMES[role]),
    validate(({ role }) => FINISH_REGISTRATION_FILES_MAP_SCHEMES[role], 'files'),
    finishRegistration.finishRegistration,
);

module.exports = router;
