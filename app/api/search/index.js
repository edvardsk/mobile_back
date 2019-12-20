const express = require('express');
const { ROUTES } = require('constants/routes');

const getCargos = require('./cargos/get');
const getCars = require('./cars/get');

// middlewares
const { validate } = require('api/middlewares/validator');
const {
    injectNotRequiredUser,
    injectNotRequiredCompanyId,
} = require('api/middlewares');

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
    injectNotRequiredCompanyId,
    getCargos.searchCargo,
);

router.get(
    ROUTES.SEARCH.CARGOS.BASE + ROUTES.SEARCH.CARGOS.GET_ALL,
    validate(ValidatorSchemes.searchAllCargosQuery, 'query'),
    validate(ValidatorSchemes.modifyStringValues, 'query'),
    validate(ValidatorSchemes.searchAllCargosAfterModifyingQuery, 'query'),
    injectNotRequiredUser,
    injectNotRequiredCompanyId,
    getCargos.getAllNewCargos,
);

// cars
router.get(
    ROUTES.SEARCH.CARS.BASE + ROUTES.SEARCH.CARS.GET,
    validate(ValidatorSchemes.searchCarQuery, 'query'),
    validate(ValidatorSchemes.modifyStringValues, 'query'),
    validate(ValidatorSchemes.searchCarAfterModifyingQuery, 'query'),
    validate(ValidatorSchemes.searchCarAsync, 'query'),
    injectNotRequiredUser,
    injectNotRequiredCompanyId,
    getCars.searchCars,
);

router.get(
    ROUTES.SEARCH.CARS.BASE + ROUTES.SEARCH.CARS.GET_ALL,
    validate(ValidatorSchemes.searchAllCarsQuery, 'query'),
    validate(ValidatorSchemes.modifyStringValues, 'query'),
    validate(ValidatorSchemes.searchAllCarsAfterModifyingQuery, 'query'),
    injectNotRequiredUser,
    injectNotRequiredCompanyId,
    getCars.getAllCars,
);

module.exports = router;
