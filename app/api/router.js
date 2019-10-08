const express = require('express');
const { ROUTES } = require('constants/routes');
const auth = require('./auth');

const users = require('./users');

const router = express.Router();

router.use(ROUTES.AUTH.BASE, auth);
router.use(ROUTES.USERS.BASE, users);

module.exports = router;
