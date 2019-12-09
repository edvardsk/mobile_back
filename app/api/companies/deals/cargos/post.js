const { success, reject } = require('api/response');

// services
const CargosService = require('services/tables/cargos');
const DriversService = require('services/tables/drivers');
const CarsService = require('services/tables/cars');
const TrailersService = require('services/tables/trailers');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const { LOADING_TYPES_MAP } = require('constants/cargos');

// formatters
const { formatPricesFromPostgresJSON } = require('formatters/cargo-prices');

// helpers
const {
    validateCargos,
    validateCars,
    validateDrivers,
    validateTrailers,
    extractData,
} = require('helpers/validators/deals');

const colsCargos = SQL_TABLES.CARGOS.COLUMNS;

const createCargoDeal = async (req, res, next) => {
    try {
        const { body } = req;

        const { company } = res.locals;

        const [cargosIds, driversIds, shadowDrivers, carsIds, shadowCars, trailersIds, shadowTrailers] = extractData(body);

        /* validate cargos */
        const availableCargos = await CargosService.getAvailableCargosByIds(cargosIds);
        if (!availableCargos.length) {
            return reject(res, ERRORS.DEALS.NO_CARGOS);
        }

        const cargoLoadingType = availableCargos[0][colsCargos.LOADING_TYPE];
        if (!availableCargos.every(cargo => cargo[colsCargos.LOADING_TYPE] === cargoLoadingType)) {
            return reject(res, ERRORS.DEALS.DIFFERENT_CARGO_LOADING_METHOD);
        }

        const cargosIdsSet = new Set(cargosIds);
        const drivesIdsSet = new Set(driversIds);
        const carsIdsSet = new Set(carsIds);
        const trailersIdsSet = new Set(trailersIds);

        if (
            (LOADING_TYPES_MAP.FTL && (
                cargosIdsSet.size !== cargosIds.length ||
                drivesIdsSet.size + shadowDrivers.length !== driversIds.length ||
                carsIdsSet.size + shadowCars.length !== carsIds.length ||
                trailersIdsSet.size + shadowTrailers.length !== trailersIds.length
            ))
            ||
            (LOADING_TYPES_MAP.LTL && (
                cargosIdsSet.size !== 1 ||
                drivesIdsSet.size + shadowDrivers.length !== 1 ||
                carsIdsSet.size + shadowCars.length !== 1 ||
                trailersIdsSet.size + shadowTrailers.length !== 1
            ))
        ) {
            return reject(res, ERRORS.DEALS.DUPLICATE_DATA);
        }

        const cargosFromDb = availableCargos.map(cargo => ({
            ...cargo,
            [HOMELESS_COLUMNS.PRICES]: formatPricesFromPostgresJSON(cargo[HOMELESS_COLUMNS.PRICES]),
        }));

        const invalidCargos = validateCargos(body, cargosFromDb);
        if (invalidCargos.length) {
            return reject(res, invalidCargos);
        }

        /* validate drivers */
        const availableDrivers = (driversIds.length && await DriversService.getAvailableDriversByIdsAndCompanyId(driversIds, company.id)) || [];
        const invalidDrivers = validateDrivers(body, availableDrivers);
        if (invalidDrivers.length) {
            return reject(res, invalidDrivers);
        }

        /* validate cars */
        const availableCars = (carsIds.length && await CarsService.getAvailableCarsByIdsAndCompanyId(carsIds, company.id)) || [];
        const invalidCars = validateCars(body, availableCars);
        if (invalidCars.length) {
            return reject(res, invalidCars);
        }

        /* validate trailers */
        const availableTrailers = (trailersIds.length && await TrailersService.getAvailableTrailersByIdsAndCompanyId(trailersIds, company.id)) || [];
        const invalidTrailers = validateTrailers(body, availableTrailers);
        if (invalidTrailers.length) {
            return reject(res, invalidTrailers);
        }

        return success(res, {});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCargoDeal,
};
