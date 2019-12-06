const express = require('express');
const { ROUTES } = require('constants/routes');
const get = require('./get');

// middlewares
const { injectNotRequiredUser } = require('api/middlewares');
const { validate } = require('api/middlewares/validator');

// helpers
const ValidatorSchemes = require('helpers/validators/schemes');

const router = express.Router();

router.get(
    ROUTES.CARGOS.GET,
    validate(ValidatorSchemes.requiredCargoId, 'params'),
    validate(ValidatorSchemes.requiredExistingCargoAsync, 'params'),
    injectNotRequiredUser,
    get.getCargo,
);

module.exports = router;
