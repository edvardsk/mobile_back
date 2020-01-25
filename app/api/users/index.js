const express = require('express');

const get = require('./get');
const characteristics = require('./characteristics');

// constants
const { ROUTES } = require('constants/routes');

const router = express.Router();

// users
router.get(ROUTES.USERS.ME.BASE + ROUTES.USERS.ME.GET, get.getUser);

// characteristics
router.get(ROUTES.USERS.ME.BASE + ROUTES.USERS.ME.CHARACTERISTICS, characteristics.get);
router.post(ROUTES.USERS.ME.BASE + ROUTES.USERS.ME.CHARACTERISTICS, characteristics.post);
router.put(ROUTES.USERS.ME.BASE + ROUTES.USERS.ME.CHARACTERISTICS, characteristics.put);

module.exports = router;
