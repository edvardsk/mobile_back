const express = require('express');
const { ROUTES } = require('constants/routes');

const getVehicleTypes = require('./vehicle-types/get');

const getDangerClasses = require('./danger-classes/get');

const getCurrencies = require('./currencies/get');

// middlewares
const { isHasPermissions } = require('api/middlewares');

// constants
const { PERMISSIONS } = require('constants/system');

const router = express.Router();


// vehicle types
router.get(
    ROUTES.OTHERS.VEHICLE_TYPES.BASE + ROUTES.OTHERS.VEHICLE_TYPES.GET_ALL,
    isHasPermissions([PERMISSIONS.CRUD_CARGO]),
    getVehicleTypes.getTypes,
);


// danger classes
router.get(
    ROUTES.OTHERS.DANGER_CLASSES.BASE + ROUTES.OTHERS.DANGER_CLASSES.GET_ALL,
    isHasPermissions([PERMISSIONS.CRUD_CARGO]),
    getDangerClasses.getClasses,
);

// currencies
router.get(
    ROUTES.OTHERS.CURRENCIES.BASE + ROUTES.OTHERS.CURRENCIES.GET_ALL,
    getCurrencies.getListCurrencies,
);

module.exports = router;
