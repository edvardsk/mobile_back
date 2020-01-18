const express = require('express');

// routes
const authorization = require('./authorization');
const registration = require('./registration');

// constants
const { ROUTES } = require('constants/routes');

// helpers
const ValidatorSchemes = require('helpers/validators/schemes');

// middlewares
const { isAuthenticated } = require('api/middlewares');
const { validate } = require('api/middlewares/validator');

const router = express.Router();

router.use('/*', isAuthenticated);

// registration/authorization
router.post(
    ROUTES.AUTH.AUTHORIZATION.BASE + ROUTES.AUTH.AUTHORIZATION.POST,
    validate(ValidatorSchemes.authorization),
    authorization.checkUserExisting,
    authorization.generateToken,
);

router.post(
    ROUTES.AUTH.REGISTRATION.BASE + ROUTES.AUTH.REGISTRATION.POST,
    validate(ValidatorSchemes.registration),
    registration.createUser
);

module.exports = router;
