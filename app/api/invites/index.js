const express = require('express');
const { ROUTES } = require('constants/routes');
const post = require('./post');
const postUsers = require('./users/post');

// middlewares
const { isHasPermissions } = require('api/middlewares');
const { validate } = require('api/middlewares/validator');

// constants
const { PERMISSIONS, ROLES } = require('constants/system');

// helpers
const ValidatorSchemes = require('helpers/validators/schemes');

const router = express.Router();

const INVITE_USER_MAP_PERMISSIONS = {
    [ROLES.MANAGER]: [PERMISSIONS.INVITE_MANAGER],
    [ROLES.DISPATCHER]: [PERMISSIONS.INVITE_DISPATCHER],
};

router.post(
    ROUTES.INVITES.ROLES.BASE + ROUTES.INVITES.ROLES.POST,
    validate(ValidatorSchemes.inviteUserRolesParams, 'params'),
    isHasPermissions(({ params }) => INVITE_USER_MAP_PERMISSIONS[params.role]),
    validate(ValidatorSchemes.inviteUser),
    validate(ValidatorSchemes.inviteUserAsync),
    validate(ValidatorSchemes.phoneNumberWithPrefixAsync),
    post.inviteUser
);

router.post(
    ROUTES.INVITES.RESEND.BASE + ROUTES.INVITES.RESEND.USERS.BASE + ROUTES.INVITES.RESEND.USERS.POST,
    isHasPermissions([PERMISSIONS.BASIC_INVITES]),
    validate(ValidatorSchemes.requiredUserId, 'params'),
    validate(ValidatorSchemes.requiredExistingUserWithIdAsync, 'params'),
    postUsers.resendInvite
);

module.exports = router;
