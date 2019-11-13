const express = require('express');
const { ROUTES } = require('constants/routes');

const getCargoStatuses = require('./cargo-statuses/get');

const getVehicleTypes = require('./vehicle-types/get');

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


// vehicle types
router.get(
    ROUTES.OTHERS.VEHICLE_TYPES.BASE + ROUTES.OTHERS.VEHICLE_TYPES.GET,
    isHasPermissions([PERMISSIONS.CRUD_CARGO]),
    getVehicleTypes.getTypes,
);

module.exports = router;
