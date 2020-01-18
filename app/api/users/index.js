const express = require('express');
const get = require('./get');

// constants
const { ROUTES } = require('constants/routes');

const router = express.Router();

// users
router.get(ROUTES.USERS.ME.BASE + ROUTES.USERS.ME.GET, get.getUser);

module.exports = router;
