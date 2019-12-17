const express = require('express');
const { ROUTES } = require('constants/routes');

const getVehicleTypes = require('./vehicle-types/get');
const getDangerClasses = require('./danger-classes/get');
const getCurrencies = require('./currencies/get');
const getExchangeRates = require('./exchange-rates/get');
const getTNVEDCodes = require('./tnved-codes/get');
const postTNVEDCodesKeywords = require('./tnved-codes/keywords/post');
const getTNVEDCodesKeywords = require('./tnved-codes/keywords/get');
const putTNVEDCodesKeywords = require('./tnved-codes/keywords/put');
const deleteTNVEDCodesKeywords = require('./tnved-codes/keywords/delete');

const router = express.Router();

// middlewares
const { validate } = require('api/middlewares/validator');
const { isHasPermissions } = require('api/middlewares');

// constants
const { PERMISSIONS } = require('constants/system');

// helpers
const ValidatorSchemes = require('helpers/validators/schemes');


// vehicle types
router.get(
    ROUTES.OTHERS.VEHICLE_TYPES.BASE + ROUTES.OTHERS.VEHICLE_TYPES.GET_ALL,
    getVehicleTypes.getTypes,
);

// danger classes
router.get(
    ROUTES.OTHERS.DANGER_CLASSES.BASE + ROUTES.OTHERS.DANGER_CLASSES.GET_ALL,
    getDangerClasses.getClasses,
);

// currencies
router.get(
    ROUTES.OTHERS.CURRENCIES.BASE + ROUTES.OTHERS.CURRENCIES.GET_ALL,
    getCurrencies.getListCurrencies,
);

// exchange rates
router.get(
    ROUTES.OTHERS.EXCHANGE_RATES.BASE + ROUTES.OTHERS.EXCHANGE_RATES.GET_ALL,
    getExchangeRates.getListRates,
);

// tnved codes
router.get(
    ROUTES.OTHERS.TNVED_CODES.BASE + ROUTES.OTHERS.TNVED_CODES.GET_ALL,
    getTNVEDCodes.getAllCodes,
);

router.get(
    ROUTES.OTHERS.TNVED_CODES.BASE + ROUTES.OTHERS.TNVED_CODES.GET,
    validate(ValidatorSchemes.modifyFilterQuery, 'query'),
    validate(ValidatorSchemes.tnvedCodesFilterQuery, 'query'),
    getTNVEDCodes.getCodesByKeyword,
);

// tnved codes keywords
router.post(
    ROUTES.OTHERS.TNVED_CODES.BASE + ROUTES.OTHERS.TNVED_CODES.KEYWORDS.BASE + ROUTES.OTHERS.TNVED_CODES.KEYWORDS.POST,
    isHasPermissions([PERMISSIONS.CRUD_TNVED_CODES_KEYWORDS]),
    validate(ValidatorSchemes.createOrEditTNVEDKeyword),
    validate(ValidatorSchemes.createOrEditTNVEDKeywordAsync),
    postTNVEDCodesKeywords.addKeyword,
);

router.get(
    ROUTES.OTHERS.TNVED_CODES.BASE + ROUTES.OTHERS.TNVED_CODES.KEYWORDS.BASE + ROUTES.OTHERS.TNVED_CODES.KEYWORDS.GET_ALL,
    isHasPermissions([PERMISSIONS.CRUD_TNVED_CODES_KEYWORDS]),
    getTNVEDCodesKeywords.getAllKeywords,
);

router.get(
    ROUTES.OTHERS.TNVED_CODES.BASE + ROUTES.OTHERS.TNVED_CODES.KEYWORDS.BASE + ROUTES.OTHERS.TNVED_CODES.KEYWORDS.GET,
    isHasPermissions([PERMISSIONS.CRUD_TNVED_CODES_KEYWORDS]),
    validate(ValidatorSchemes.tnvedCodesIdQuery, 'query'),
    getTNVEDCodesKeywords.getKeywordsByTNVEDCodeId,
);

router.put(
    ROUTES.OTHERS.TNVED_CODES.BASE + ROUTES.OTHERS.TNVED_CODES.KEYWORDS.BASE + ROUTES.OTHERS.TNVED_CODES.KEYWORDS.PUT,
    isHasPermissions([PERMISSIONS.CRUD_TNVED_CODES_KEYWORDS]),
    validate(ValidatorSchemes.createOrEditTNVEDKeyword),
    validate(ValidatorSchemes.createOrEditTNVEDKeywordAsync),
    putTNVEDCodesKeywords.editTNVEDCodesKeywordById,
);

router.delete(
    ROUTES.OTHERS.TNVED_CODES.BASE + ROUTES.OTHERS.TNVED_CODES.KEYWORDS.BASE + ROUTES.OTHERS.TNVED_CODES.KEYWORDS.DELETE,
    isHasPermissions([PERMISSIONS.CRUD_TNVED_CODES_KEYWORDS]),
    deleteTNVEDCodesKeywords.deleteTNVEDCodesKeywordById,
);

module.exports = router;
