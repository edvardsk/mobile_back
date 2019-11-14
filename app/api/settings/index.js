const express = require('express');
const { ROUTES } = require('constants/routes');

const getEconomicDefault = require('./economics/default/get');
const putEconomicDefault = require('./economics/default/put');

// middlewares
const { isHasPermissions } = require('api/middlewares');
const { validate, validateEconomicPercentsSum } = require('api/middlewares/validator');

// constants
const { PERMISSIONS } = require('constants/system');

// helpers
const ValidatorSchemes = require('helpers/validators/schemes');

const router = express.Router();


// default
router.get(
    ROUTES.SETTINGS.ECONOMICS.BASE + ROUTES.SETTINGS.ECONOMICS.DEFAULT.BASE + ROUTES.SETTINGS.ECONOMICS.DEFAULT.GET,
    isHasPermissions([PERMISSIONS.READ_DEFAULT_ECONOMIC_SETTINGS]),
    getEconomicDefault.getDefaultEconomicSettings,
);

router.put(
    ROUTES.SETTINGS.ECONOMICS.BASE + ROUTES.SETTINGS.ECONOMICS.DEFAULT.BASE + ROUTES.SETTINGS.ECONOMICS.DEFAULT.PUT,
    isHasPermissions([PERMISSIONS.EDIT_DEFAULT_ECONOMIC_SETTINGS]),
    validate(ValidatorSchemes.createOrEditEconomicSettings),
    validateEconomicPercentsSum,
    putEconomicDefault.editDefaultEconomicSettings,
);

module.exports = router;
