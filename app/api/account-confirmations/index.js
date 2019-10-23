const express = require('express');

const router = express.Router();

// routes
const getUsers = require('./users/get');
const postUsers = require('./users/post');

// constants
const { ROUTES } = require('constants/routes');

router.get(
    ROUTES.ACCOUNT_CONFIRMATIONS.USERS.BASE + ROUTES.ACCOUNT_CONFIRMATIONS.USERS.GET_ALL,
    getUsers.getListUsers,
);

router.get(
    ROUTES.ACCOUNT_CONFIRMATIONS.USERS.BASE + ROUTES.ACCOUNT_CONFIRMATIONS.USERS.GET,
    getUsers.getAllUserData,
);

router.post(
    ROUTES.ACCOUNT_CONFIRMATIONS.USERS.BASE + ROUTES.ACCOUNT_CONFIRMATIONS.USERS.POST,
    postUsers.confirmAccount,
);

module.exports = router;
