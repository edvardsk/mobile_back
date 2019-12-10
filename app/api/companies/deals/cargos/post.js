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
    validateShadowCars,
    validateShadowTrailers,
    validateCarsTrailers,
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

        const shadowDriversSet = new Set(shadowDrivers.map(driver => `${driver[HOMELESS_COLUMNS.PHONE_PREFIX_ID]}${driver[HOMELESS_COLUMNS.PHONE_NUMBER]}`));
        const shadowCarsSet = new Set(shadowCars.map(car => car[HOMELESS_COLUMNS.CAR_STATE_NUMBER]));
        const shadowTrailersSet = new Set(shadowTrailers.map(trailer => trailer[HOMELESS_COLUMNS.TRAILER_STATE_NUMBER]));

        if (
            (cargoLoadingType === LOADING_TYPES_MAP.FTL && (
                cargosIdsSet.size !== cargosIds.length ||
                drivesIdsSet.size + shadowDriversSet.size !== body.length ||
                carsIdsSet.size + shadowCarsSet.size !== body.length ||
                trailersIdsSet.size + shadowTrailersSet.size > body.length
            ))
            ||
            (cargoLoadingType === LOADING_TYPES_MAP.LTL && (
                cargosIdsSet.size !== cargosIds.length ||
                drivesIdsSet.size + shadowDriversSet.size !== 1 ||
                carsIdsSet.size + shadowCarsSet.size !== 1 ||
                trailersIdsSet.size + shadowTrailersSet.size > 1
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

        /* validate shadow cars */
        if (shadowCars.length) {
            const carsStateNumbers = shadowCars.map(car => car[HOMELESS_COLUMNS.CAR_STATE_NUMBER]);
            const carsFromDb = await CarsService.getRecordsByStateNumbers(carsStateNumbers);
            const invalidShadowCars = validateShadowCars(body, carsFromDb);
            if (invalidShadowCars.length) {
                return reject(res, invalidShadowCars);
            }
        }

        /* validate shadow trailers */
        if (shadowTrailers.length) {
            const trailersStateNumbers = shadowTrailers.map(trailer => trailer[HOMELESS_COLUMNS.TRAILER_STATE_NUMBER]);
            const trailersFromDb = await TrailersService.getRecordsByStateNumbers(trailersStateNumbers);
            const invalidShadowTrailers = validateShadowTrailers(body, trailersFromDb);
            if (invalidShadowTrailers.length) {
                return reject(res, invalidShadowTrailers);
            }
        }

        /* validate cars and trailers */
        const invalidCarsTrailers = validateCarsTrailers(body, availableCars, availableTrailers, cargoLoadingType);
        if (invalidCarsTrailers.length) {
            return reject(res, invalidCarsTrailers);
        }


        return success(res, {});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCargoDeal,
};
