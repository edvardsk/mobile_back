const express = require('express');

const router = express.Router();

// middlewares
const { isHasPermissions } = require('api/middlewares');
const { validate } = require('api/middlewares/validator');

// constants
const { PERMISSIONS } = require('constants/system');

// routes
const getUsers = require('./users/get');
const postUsers = require('./users/post');

// constants
const { ROUTES } = require('constants/routes');

// helpers
const ValidationSchemes = require('helpers/validators/schemes');

router.get(
    ROUTES.ACCOUNT_CONFIRMATIONS.USERS.BASE + ROUTES.ACCOUNT_CONFIRMATIONS.USERS.GET_ALL,
    isHasPermissions([PERMISSIONS.ACCEPT_REGISTRATION]),
    getUsers.getListUsers,
);

router.get(
    ROUTES.ACCOUNT_CONFIRMATIONS.USERS.BASE + ROUTES.ACCOUNT_CONFIRMATIONS.USERS.GET,
    isHasPermissions([PERMISSIONS.ACCEPT_REGISTRATION]),
    validate(ValidationSchemes.requiredUserId, 'params'),
    validate(ValidationSchemes.requiredExistingUserWithIdAsync, 'params'),
    getUsers.getAllUserData,
);

router.post(
    ROUTES.ACCOUNT_CONFIRMATIONS.USERS.BASE + ROUTES.ACCOUNT_CONFIRMATIONS.USERS.POST,
    isHasPermissions([PERMISSIONS.ACCEPT_REGISTRATION]),
    validate(ValidationSchemes.requiredUserId, 'params'),
    validate(ValidationSchemes.requiredExistingUserWithIdAsync, 'params'),
    postUsers.confirmAccount,
);

module.exports = router;
