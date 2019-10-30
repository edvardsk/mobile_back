const express = require('express');
const { ROUTES } = require('constants/routes');
const get = require('./get');
const postFreeze = require('./freeze/post');
const postUnfreeze = require('./unfreeze/post');

// middlewares
const { validate } = require('api/middlewares/validator');

// helpers
const ValidatorSchemes = require('helpers/validators/schemes');

const router = express.Router();


// users
router.get(ROUTES.USERS.ME.BASE + ROUTES.USERS.ME.GET, get.getUser);


//freezing
router.post(
    ROUTES.USERS.FREEZE.BASE + ROUTES.USERS.FREEZE.POST,
    validate(ValidatorSchemes.requiredUserId, 'params'),
    postFreeze.freezeUser,
);

router.post(
    ROUTES.USERS.UNFREEZE.BASE + ROUTES.USERS.UNFREEZE.POST,
    validate(ValidatorSchemes.requiredUserId, 'params'),
    postUnfreeze.unfreezeUser,
);

module.exports = router;
