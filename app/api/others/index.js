const express = require('express');
const { ROUTES } = require('constants/routes');

const getVehicleTypes = require('./vehicle-types/get');

const getDangerClasses = require('./danger-classes/get');

const getCurrencies = require('./currencies/get');

const getExchangeRates = require('./exchange-rates/get');

const getDealStatuses = require('./deal-statuses/get');

const router = express.Router();


// vehicle types
router.get(
    ROUTES.OTHERS.VEHICLE_TYPES.BASE + ROUTES.OTHERS.VEHICLE_TYPES.GET_ALL,
    getVehicleTypes.getTypes,
);

// danger classes
router.get(
    ROUTES.OTHERS.DANGER_CLASSES.BASE + ROUTES.OTHERS.DANGER_CLASSES.GET_ALL,
    getDangerClasses.getClasses,
);

// currencies
router.get(
    ROUTES.OTHERS.CURRENCIES.BASE + ROUTES.OTHERS.CURRENCIES.GET_ALL,
    getCurrencies.getListCurrencies,
);

// exchange rates
router.get(
    ROUTES.OTHERS.EXCHANGE_RATES.BASE + ROUTES.OTHERS.EXCHANGE_RATES.GET_ALL,
    getExchangeRates.getListRates,
);

// deal-statuses
router.get(
    ROUTES.OTHERS.DEAL_STATUSES.BASE + ROUTES.OTHERS.DEAL_STATUSES.GET_ALL,
    getDealStatuses.getStatuses,
);

module.exports = router;
