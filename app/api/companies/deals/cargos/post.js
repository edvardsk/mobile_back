const { success, reject } = require('api/response');

// services
const CargosService = require('services/tables/cargos');
const DriversService = require('services/tables/drivers');
const CarsService = require('services/tables/cars');
const TrailersService = require('services/tables/trailers');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { ERRORS } = require('constants/errors');

// formatters
const { formatPricesFromPostgresJSON } = require('formatters/cargo-prices');

// helpers
const { isValidUUID } = require('helpers/validators');

const colsCargos = SQL_TABLES.CARGOS.COLUMNS;
const colsCargoPrices = SQL_TABLES.CARGO_PRICES.COLUMNS;

const createCargoDeal = async (req, res, next) => {
    try {
        const { body } = req;

        const { company } = res.locals;

        const [cargosIds, driversIds, carsIds, trailersIds] = body.reduce((acc, item) => {
            const [cargosIds, driversIds, carsIds, trailersIds] = acc;
            const cargoId = item[HOMELESS_COLUMNS.CARGO_ID];
            const driverId = item[HOMELESS_COLUMNS.DRIVER_ID_OR_FULL_NAME];
            const carId = item[HOMELESS_COLUMNS.CAR_ID_OR_STATE_NUMBER];
            const trailerId = item[HOMELESS_COLUMNS.TRAILER_ID_OR_STATE_NUMBER];

            cargosIds.push(cargoId);
            isValidUUID(driverId) && driversIds.push(driverId);
            isValidUUID(carId) && carsIds.push(carId);
            isValidUUID(trailerId) && trailersIds.push(trailerId);

            return [cargosIds, driversIds, carsIds, trailersIds];
        }, [[], [], [], []]);

        /* validate cargos */
        const availableCargos = await CargosService.getAvailableCargosByIds(cargosIds);
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

const validateCargos = (body, cargosFromDb) => {
    return body.reduce((notValidCargos, item, i) => {
        const dealCargoId = item[HOMELESS_COLUMNS.CARGO_ID];
        const cargoFromDb = cargosFromDb.find(cargo => cargo.id === dealCargoId);
        if (!cargoFromDb) {
            notValidCargos.push({
                position: i,
                type: ERRORS.DEALS.CARGO_NOT_EXISTS,
            });
        } else {
            const dealCurrencyId = item[HOMELESS_COLUMNS.PAY_CURRENCY_ID];
            const cargoPricesDb = cargoFromDb[HOMELESS_COLUMNS.PRICES];
            const priceFromDb = cargoPricesDb.find(price => price[colsCargoPrices.CURRENCY_ID] === dealCurrencyId);
            if (!priceFromDb) {
                notValidCargos.push({
                    position: i,
                    type: ERRORS.DEALS.INVALID_CURRENCY,
                });
            }

            const freeCountDb = cargoFromDb[colsCargos.FREE_COUNT];
            const freeCountDeal = item[colsCargos.COUNT];
            if (freeCountDb < freeCountDeal) {
                notValidCargos.push({
                    position: i,
                    type: ERRORS.DEALS.INVALID_CARGO_COUNT,
                });
            }


        }
        return notValidCargos;
    }, []);
};

const validateDrivers = (body, driversFromDb) => {
    return body.reduce((notValidDrivers, item, i) => {
        const dealDriverId = item[HOMELESS_COLUMNS.DRIVER_ID_OR_FULL_NAME];
        if (isValidUUID(dealDriverId)) {
            const driverFromDb = driversFromDb.find(driver => driver.id === dealDriverId);
            if (!driverFromDb) {
                notValidDrivers.push({
                    position: i,
                    type: ERRORS.DEALS.INVALID_DRIVER_ID,
                });
            }
        }
        return notValidDrivers;
    }, []);
};

const validateCars = (body, carsFromDb) => {
    return body.reduce((notValidCars, item, i) => {
        const dealCarId = item[HOMELESS_COLUMNS.CAR_ID_OR_STATE_NUMBER];
        if (isValidUUID(dealCarId)) {
            const carFromDb = carsFromDb.find(car => car.id === dealCarId);
            if (!carFromDb) {
                notValidCars.push({
                    position: i,
                    type: ERRORS.DEALS.INVALID_CAR_ID,
                });
            }
        }
        return notValidCars;
    }, []);
};

const validateTrailers = (body, trailersFromDb) => {
    return body.reduce((notValidTrailers, item, i) => {
        const dealTrailerId = item[HOMELESS_COLUMNS.TRAILER_ID_OR_STATE_NUMBER];
        if (isValidUUID(dealTrailerId)) {
            const trailerFromDb = trailersFromDb.find(trailer => trailer.id === dealTrailerId);
            if (!trailerFromDb) {
                notValidTrailers.push({
                    position: i,
                    type: ERRORS.DEALS.INVALID_TRAILER_ID,
                });
            }
        }
        return notValidTrailers;
    }, []);
};

module.exports = {
    createCargoDeal,
};
