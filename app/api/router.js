const express = require('express');
const { ROUTES } = require('constants/routes');
const auth = require('./auth');

const users = require('./users');
const conditionsTerms = require('./conditions-terms');
const invites = require('./invites');
const companies = require('./companies');
const others = require('./others');
const settings = require('./settings');
const search = require('./search');
const cargos = require('./cargos');

const router = express.Router();

router.use(ROUTES.AUTH.BASE, auth);
router.use(ROUTES.USERS.BASE, users);
router.use(ROUTES.CONDITIONS_TERMS.BASE, conditionsTerms);
router.use(ROUTES.INVITES.BASE, invites);
router.use(ROUTES.COMPANIES.BASE, companies);
router.use(ROUTES.OTHERS.BASE, others);
router.use(ROUTES.SETTINGS.BASE, settings);
router.use(ROUTES.SEARCH.BASE, search);
router.use(ROUTES.CARGOS.BASE, cargos);

module.exports = router;
