const express = require('express');
const get = require('./get');
const postFreeze = require('./freeze/post');
const postUnfreeze = require('./unfreeze/post');

// constants
const { ROUTES } = require('constants/routes');
const { PERMISSIONS } = require('constants/system');

// middlewares
const { validate } = require('api/middlewares/validator');
const { isHasPermissions } = require('api/middlewares');

// helpers
const ValidatorSchemes = require('helpers/validators/schemes');

const router = express.Router();


// users
router.get(ROUTES.USERS.ME.BASE + ROUTES.USERS.ME.GET, get.getUser);

router.get(
    ROUTES.USERS.GET_ALL,
    isHasPermissions([PERMISSIONS.READ_LIST_USERS]),
    validate(ValidatorSchemes.basePaginationQuery, 'query'),
    validate(ValidatorSchemes.basePaginationModifyQuery, 'query'),
    validate(ValidatorSchemes.baseSortingSortingDirectionQuery, 'query'),
    validate(ValidatorSchemes.usersSortColumnQuery, 'query'),
    validate(ValidatorSchemes.modifyFilterQuery, 'query'),
    validate(ValidatorSchemes.usersFilterQuery, 'query'),
    get.getUsers,
);


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
