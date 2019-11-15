const express = require('express');
const { ROUTES } = require('constants/routes');

const getEconomicDefault = require('./economics/default/get');
const putEconomicDefault = require('./economics/default/put');

const postEconomicCompanies = require('./economics/companies/post');
const putEconomicCompanies = require('./economics/companies/put');

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


// companies
router.post(
    ROUTES.SETTINGS.ECONOMICS.BASE + ROUTES.SETTINGS.ECONOMICS.COMPANIES.BASE + ROUTES.SETTINGS.ECONOMICS.COMPANIES.POST,
    isHasPermissions([PERMISSIONS.CRUD_COMPANIES_ECONOMIC_SETTINGS]),
    validate(ValidatorSchemes.createOrEditEconomicSettings),
    validate(ValidatorSchemes.requiredCompanyIdParams, 'params'),
    validate(ValidatorSchemes.requiredExistingCompanyWithIdAsync, 'params'),
    validate(ValidatorSchemes.createCompanyEconomicSettingsParamsAsync, 'params'),
    postEconomicCompanies.createCompanyEconomicSettings,
);

router.put(
    ROUTES.SETTINGS.ECONOMICS.BASE + ROUTES.SETTINGS.ECONOMICS.COMPANIES.BASE + ROUTES.SETTINGS.ECONOMICS.COMPANIES.PUT,
    isHasPermissions([PERMISSIONS.CRUD_COMPANIES_ECONOMIC_SETTINGS]),
    validate(ValidatorSchemes.createOrEditEconomicSettings),
    validate(ValidatorSchemes.requiredCompanyIdParams, 'params'),
    validate(ValidatorSchemes.requiredExistingCompanyWithIdAsync, 'params'),
    validate(ValidatorSchemes.editCompanyEconomicSettingsParamsAsync, 'params'),
    putEconomicCompanies.editCompanyEconomicSettings,
);

module.exports = router;
