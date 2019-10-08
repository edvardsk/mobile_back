const express = require('express');
const { ROUTES } = require('constants/routes');
const get = require('./get');

const router = express.Router();

router.get(ROUTES.USERS.ME.BASE + ROUTES.USERS.ME.GET, get.getUser);

module.exports = router;
