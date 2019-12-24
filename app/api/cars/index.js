const express = require('express');
const { ROUTES } = require('constants/routes');

const postVerify = require('./verify/post');

const postReject = require('./reject/post');

// middlewares
const { validate } = require('api/middlewares/validator');
const { isHasPermissions } = require('api/middlewares');

// helpers
const ValidatorSchemes = require('helpers/validators/schemes');

// constants
const { PERMISSIONS } = require('constants/system');

const router = express.Router();

router.post(
    ROUTES.CARS.VERIFY.BASE + ROUTES.CARS.VERIFY.POST,
    isHasPermissions([PERMISSIONS.VERIFY_DEAL_INSTANCE]),
    validate(ValidatorSchemes.requiredCarId, 'params'),
    validate(ValidatorSchemes.requiredExistingCarAsync, 'params'),
    postVerify.verifyCar,
);

router.post(
    ROUTES.CARS.REJECT.BASE + ROUTES.CARS.REJECT.POST,
    isHasPermissions([PERMISSIONS.VERIFY_DEAL_INSTANCE]),
    validate(ValidatorSchemes.requiredCarId, 'params'),
    validate(ValidatorSchemes.requiredExistingCarAsync, 'params'),
    validate(ValidatorSchemes.rejectDraft),
    postReject.rejectDraft,
);

module.exports = router;
