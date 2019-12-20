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
    ROUTES.DRIVERS.VERIFY.BASE + ROUTES.DRIVERS.VERIFY.POST,
    isHasPermissions([PERMISSIONS.VERIFY_DEAL_INSTANCE]),
    validate(ValidatorSchemes.requiredDriverId, 'params'),
    validate(ValidatorSchemes.requiredExistingDriverAsync, 'params'),
    postVerify.verifyDriver,
);

router.post(
    ROUTES.DRIVERS.REJECT.BASE + ROUTES.DRIVERS.REJECT.POST,
    isHasPermissions([PERMISSIONS.VERIFY_DEAL_INSTANCE]),
    validate(ValidatorSchemes.requiredDriverId, 'params'),
    validate(ValidatorSchemes.requiredExistingDriverAsync, 'params'),
    validate(ValidatorSchemes.rejectDraft),
    postReject.rejectDraft,
);

module.exports = router;
