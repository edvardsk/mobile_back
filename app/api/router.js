const express = require('express');
const { ROUTES } = require('constants/routes');
const auth = require('./auth');

const users = require('./users');
const conditionsTerms = require('./conditions-terms');
const accountConfirmations = require('./account-confirmations');
const invites = require('./invites');

const router = express.Router();

router.use(ROUTES.AUTH.BASE, auth);
router.use(ROUTES.USERS.BASE, users);
router.use(ROUTES.CONDITIONS_TERMS.BASE, conditionsTerms);
router.use(ROUTES.ACCOUNT_CONFIRMATIONS.BASE, accountConfirmations);
router.use(ROUTES.INVITES.BASE, invites);

module.exports = router;
