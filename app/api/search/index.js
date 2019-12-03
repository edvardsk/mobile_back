const express = require('express');
const { ROUTES } = require('constants/routes');

const getCargos = require('./cargos/get');

// middlewares
const { validate } = require('api/middlewares/validator');
const { injectNotRequiredUser } = require('api/middlewares');

// helpers
const ValidatorSchemes = require('helpers/validators/schemes');

const router = express.Router();


// cargos
router.get(
    ROUTES.SEARCH.CARGOS.BASE + ROUTES.SEARCH.CARGOS.GET,
    validate(ValidatorSchemes.searchCargoQuery, 'query'),
    validate(ValidatorSchemes.modifyStringValues, 'query'),
    validate(ValidatorSchemes.searchCargoAfterModifyingQuery, 'query'),
    validate(ValidatorSchemes.searchCargoAsync, 'query'),
    injectNotRequiredUser,
    getCargos.searchCargo,
);

module.exports = router;
