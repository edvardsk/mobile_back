const express = require('express');
const { ROUTES } = require('constants/routes');
const post = require('./post');

// middlewares
const { isHasPermissions } = require('api/middlewares');
const { validate } = require('api/middlewares/validator');

// constants
const { PERMISSIONS } = require('constants/system');

// helpers
const ValidatorSchemes = require('helpers/validators/schemes');

const router = express.Router();

router.post(
    ROUTES.INVITES.MANAGER.BASE + ROUTES.INVITES.MANAGER.POST,
    isHasPermissions([PERMISSIONS.INVITE_MANAGER]),
    validate(ValidatorSchemes.inviteManager),
    post.inviteManager
);

router.post(
    ROUTES.INVITES.RESEND.BASE + ROUTES.INVITES.RESEND.POST,
    isHasPermissions([PERMISSIONS.BASIC_INVITES]),
    validate(ValidatorSchemes.requiredEmail),
    post.resendInvite
);

module.exports = router;
