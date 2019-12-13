const express = require('express');
const { ROUTES } = require('constants/routes');
const postVerify = require('./verify/post');

// middlewares
const { validate } = require('api/middlewares/validator');
const { isHasPermissions } = require('api/middlewares');

// helpers
const ValidatorSchemes = require('helpers/validators/schemes');

// constants
const { PERMISSIONS } = require('constants/system');

const router = express.Router();

router.post(
    ROUTES.TRAILERS.VERIFY.BASE + ROUTES.TRAILERS.VERIFY.POST,
    isHasPermissions([PERMISSIONS.VERIFY_DEAL_INSTANCE]),
    validate(ValidatorSchemes.requiredTrailerId, 'params'),
    validate(ValidatorSchemes.requiredExistingTrailerAsync, 'params'),
    postVerify.verifyTrailer,
);

module.exports = router;
