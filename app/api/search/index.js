const express = require('express');
const { ROUTES } = require('constants/routes');

const getCargosAndCars = require('./get');

// middlewares
const { validate } = require('api/middlewares/validator');
const {
    injectNotRequiredUser,
    injectNotRequiredCompanyId,
} = require('api/middlewares');

// helpers
const ValidatorSchemes = require('helpers/validators/schemes');

const router = express.Router();


router.get(
    ROUTES.SEARCH.GET,
    validate(ValidatorSchemes.searchQuery, 'query'),
    validate(ValidatorSchemes.modifyStringValues, 'query'),
    validate(ValidatorSchemes.searchAfterModifyingQuery, 'query'),
    validate(ValidatorSchemes.searchAsync, 'query'),
    injectNotRequiredUser,
    injectNotRequiredCompanyId,
    getCargosAndCars.search,
);

router.get(
    ROUTES.SEARCH.GET_ALL,
    validate(ValidatorSchemes.searchAllQuery, 'query'),
    validate(ValidatorSchemes.modifyStringValues, 'query'),
    validate(ValidatorSchemes.searchAllAfterModifyingQuery, 'query'),
    injectNotRequiredUser,
    injectNotRequiredCompanyId,
    getCargosAndCars.searchAll,
);

module.exports = router;
