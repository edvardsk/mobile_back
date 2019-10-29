const express = require('express');
const { ROUTES } = require('constants/routes');
const getEmployees = require('./employees/get');

// middlewares
const { isHasPermissions } = require('api/middlewares');
const { validate } = require('api/middlewares/validator');

// constants
const { PERMISSIONS } = require('constants/system');

// helpers
const ValidatorSchemes = require('helpers/validators/schemes');

const router = express.Router();

// employees
router.get(
    ROUTES.COMPANIES.EMPLOYEES.BASE + ROUTES.COMPANIES.EMPLOYEES.GET_ALL,
    isHasPermissions([PERMISSIONS.READ_EMPLOYEES]),
    validate(ValidatorSchemes.requiredMeParams, 'params'),
    getEmployees.getListEmployees,
);

module.exports = router;
