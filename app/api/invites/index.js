const express = require('express');
const { ROUTES } = require('constants/routes');
const post = require('./post');

// middlewares
const { isHasPermissions } = require('api/middlewares');

// constants
const { PERMISSIONS } = require('constants/system');

const router = express.Router();

router.post(
    ROUTES.INVITES.MANAGER.BASE + ROUTES.INVITES.MANAGER.POST,
    isHasPermissions([PERMISSIONS.INVITE_MANAGER]),
    post.inviteManager
);

module.exports = router;
