const uuid = require('uuid/v4');
const { success, reject } = require('api/response');

// services
const CargosServices = require('services/tables/cargos');
const CargoPointsService = require('services/tables/cargo-points');
const CargoStatusesService = require('services/tables/cargo-statuses');
const TablesService = require('services/tables');

// constants
const { SUCCESS_CODES } = require('constants/http-codes');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const { CARGO_STATUSES_MAP } = require('constants/cargo-statuses');

// formatters
const CargosFormatters = require('formatters/cargos');
const CargoPointsFormatters = require('formatters/cargo-points');

const colsCompanies = SQL_TABLES.COMPANIES.COLUMNS;

const createCar = async (req, res, next) => {
    try {
        const { body } = req;
        const { company, isControlRole } = res.locals;
        const companyId = company.id;

        const transactionsList = [];

        return success(res, { body }, SUCCESS_CODES.CREATED);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCar,
};
