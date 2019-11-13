const express = require('express');
const { ROUTES } = require('constants/routes');
const auth = require('./auth');

const users = require('./users');
const conditionsTerms = require('./conditions-terms');
const invites = require('./invites');
const companies = require('./companies');

const router = express.Router();

router.use(ROUTES.AUTH.BASE, auth);
router.use(ROUTES.USERS.BASE, users);
router.use(ROUTES.CONDITIONS_TERMS.BASE, conditionsTerms);
router.use(ROUTES.INVITES.BASE, invites);
router.use(ROUTES.COMPANIES.BASE, companies);

module.exports = router;
