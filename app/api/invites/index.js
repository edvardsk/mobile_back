const express = require('express');
const multer  = require('multer');
const { ROUTES } = require('constants/routes');
const post = require('./post');
const postUsers = require('./users/post');

// middlewares
const { isHasPermissions, injectShadowCompanyHeadByMeOrId } = require('api/middlewares');
const { validate } = require('api/middlewares/validator');
const { formDataHandler } = require('api/middlewares/files');

// constants
const { PERMISSIONS, ROLES } = require('constants/system');

// helpers
const ValidatorSchemes = require('helpers/validators/schemes');

const router = express.Router();

const upload = multer();
const uploadData = upload.any();

const INVITE_USER_WITHOUT_COMPANY_MAP_PERMISSIONS = {
    [ROLES.MANAGER]: [PERMISSIONS.INVITE_MANAGER],
};

const INVITE_USER_MAP_PERMISSIONS = {
    [ROLES.DISPATCHER]: [PERMISSIONS.INVITE_DISPATCHER],
    [ROLES.LOGISTICIAN]: [PERMISSIONS.INVITE_LOGISTICIAN],
};

const INVITE_USER_ADVANCED_MAP_PERMISSIONS = {
    [ROLES.DRIVER]: [PERMISSIONS.INVITE_DRIVER],
};


// invite
router.post(
    ROUTES.INVITES.ROLES.BASE + ROUTES.INVITES.ROLES.POST,
    validate(ValidatorSchemes.inviteUserWithoutCompanyRolesParams, 'params'),
    isHasPermissions(({ params }) => INVITE_USER_WITHOUT_COMPANY_MAP_PERMISSIONS[params.role]),
    validate(ValidatorSchemes.inviteUser),
    validate(ValidatorSchemes.inviteUserAsync),
    validate(ValidatorSchemes.phoneNumberWithPrefixAsync),
    post.inviteUserWithoutCompany
);

router.post(
    ROUTES.INVITES.COMPANIES.BASE + ROUTES.INVITES.COMPANIES.ROLES.BASE + ROUTES.INVITES.COMPANIES.ROLES.POST,
    validate(ValidatorSchemes.inviteUserRolesParams, 'params'),
    isHasPermissions(({ params }) => INVITE_USER_MAP_PERMISSIONS[params.role]),
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectShadowCompanyHeadByMeOrId,
    validate(ValidatorSchemes.inviteUser),
    validate(ValidatorSchemes.inviteUserAsync),
    validate(ValidatorSchemes.phoneNumberWithPrefixAsync),
    post.inviteUser
);

router.post(
    ROUTES.INVITES.ADVANCED.BASE + ROUTES.INVITES.ADVANCED.COMPANIES.BASE + ROUTES.INVITES.ADVANCED.COMPANIES.ROLES.BASE + ROUTES.INVITES.ADVANCED.COMPANIES.ROLES.POST,
    isHasPermissions(({ params }) => INVITE_USER_ADVANCED_MAP_PERMISSIONS[params.role]),
    formDataHandler(uploadData), // uploading files middleware
    validate(ValidatorSchemes.inviteUserRolesAdvancedParams, 'params'),
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectShadowCompanyHeadByMeOrId,
    validate(ValidatorSchemes.inviteUser),
    validate(ValidatorSchemes.inviteUserAsync),
    validate(ValidatorSchemes.phoneNumberWithPrefixAsync),
    post.inviteUserAdvanced
);


// resend invite
router.post(
    ROUTES.INVITES.RESEND.BASE + ROUTES.INVITES.RESEND.USERS.BASE + ROUTES.INVITES.RESEND.USERS.POST,
    isHasPermissions([PERMISSIONS.BASIC_INVITES]),
    validate(ValidatorSchemes.requiredUserId, 'params'),
    validate(ValidatorSchemes.requiredExistingUserWithIdAsync, 'params'),
    postUsers.resendInvite
);

module.exports = router;
