const express = require('express');
const { ROUTES } = require('constants/routes');

const postVerify = require('./verify/post');

const postReject = require('./reject/post');
const getTrailer = require('./get');

// middlewares
const { validate } = require('api/middlewares/validator');
const { isHasPermissions } = require('api/middlewares');

// helpers
const ValidatorSchemes = require('helpers/validators/schemes');

// constants
const { PERMISSIONS } = require('constants/system');

const router = express.Router();

router.get(
    ROUTES.TRAILERS.GET,
    validate(ValidatorSchemes.requiredTrailerId, 'params'),
    validate(ValidatorSchemes.requiredExistingTrailerAsync, 'params'),
    getTrailer.getTrailerUnauthorized,
);

router.post(
    ROUTES.TRAILERS.VERIFY.BASE + ROUTES.TRAILERS.VERIFY.POST,
    isHasPermissions([PERMISSIONS.VERIFY_DEAL_INSTANCE]),
    validate(ValidatorSchemes.requiredTrailerId, 'params'),
    validate(ValidatorSchemes.requiredExistingTrailerAsync, 'params'),
    postVerify.verifyTrailer,
);

router.post(
    ROUTES.TRAILERS.REJECT.BASE + ROUTES.TRAILERS.REJECT.POST,
    isHasPermissions([PERMISSIONS.VERIFY_DEAL_INSTANCE]),
    validate(ValidatorSchemes.requiredTrailerId, 'params'),
    validate(ValidatorSchemes.requiredExistingCarAsync, 'params'),
    validate(ValidatorSchemes.rejectDraft),
    postReject.rejectDraft,
);

module.exports = router;
