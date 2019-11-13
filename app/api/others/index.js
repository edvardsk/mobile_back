const express = require('express');
const { ROUTES } = require('constants/routes');
const getCargoStatuses = require('./cargo-statuses/get');

// middlewares
const { isHasPermissions } = require('api/middlewares');

// constants
const { PERMISSIONS } = require('constants/system');

const router = express.Router();


// cargo statuses
router.get(
    ROUTES.OTHERS.CARGO_STATUSES.BASE + ROUTES.OTHERS.CARGO_STATUSES.GET,
    isHasPermissions([PERMISSIONS.CRUD_CARGO]),
    getCargoStatuses.getStatuses,
);

module.exports = router;
