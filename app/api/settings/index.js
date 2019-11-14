const express = require('express');
const { ROUTES } = require('constants/routes');

const getEconomicDefault = require('./economics/default/get');

// middlewares
const { isHasPermissions } = require('api/middlewares');

// constants
const { PERMISSIONS } = require('constants/system');

const router = express.Router();


// default
router.get(
    ROUTES.SETTINGS.ECONOMICS.BASE + ROUTES.SETTINGS.ECONOMICS.DEFAULT.BASE + ROUTES.SETTINGS.ECONOMICS.DEFAULT.GET,
    isHasPermissions([PERMISSIONS.READ_DEFAULT_ECONOMIC_SETTINGS]),
    getEconomicDefault.getDefaultEconomicSettings,
);

module.exports = router;
