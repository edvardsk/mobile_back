const express = require('express');

const router = express.Router();

// routes
const getUsers = require('./users/get');
const postUsers = require('./users/post');

// constants
const { ROUTES } = require('constants/routes');
// const { PERMISSIONS } = require('constants/system');
// const ValidatorSchemes = require('helpers/validators/schemes');

// middlewares
// const { isHasPermissions } = require('api/middlewares');

// accept registration
router.get(
    ROUTES.ACCOUNT_CONFIRMATIONS.USERS.BASE + ROUTES.ACCOUNT_CONFIRMATIONS.USERS.GET_ALL,
    // isHasPermissions([PERMISSIONS.ACCEPT_REGISTRATION]),
    getUsers.getListUsers,
);

router.get(
    ROUTES.ACCOUNT_CONFIRMATIONS.USERS.BASE + ROUTES.ACCOUNT_CONFIRMATIONS.USERS.GET,
    // isHasPermissions([PERMISSIONS.ACCEPT_REGISTRATION]),
    getUsers.getAllUserData,
);

router.post(
    ROUTES.ACCOUNT_CONFIRMATIONS.USERS.BASE + ROUTES.ACCOUNT_CONFIRMATIONS.USERS.POST,
    // isHasPermissions([PERMISSIONS.ACCEPT_REGISTRATION]),
    postUsers.confirmAccount,
);

module.exports = router;
