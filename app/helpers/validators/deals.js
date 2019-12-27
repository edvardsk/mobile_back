// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const { LOADING_TYPES_MAP } = require('constants/cargos');

// helpers
const { isValidUUID } = require('./index');

const colsCargos = SQL_TABLES.CARGOS.COLUMNS;
const colsCargoPrices = SQL_TABLES.CARGO_PRICES.COLUMNS;

const validateCargos = (body, cargosFromDb) => {
    return body.reduce((acc, item, i) => {
        const [notValidCargos, takenCargos] = acc;
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
            const cargoCountFromTaken = takenCargos[dealCargoId];
            if (cargoCountFromTaken === undefined) {
                takenCargos[dealCargoId] = 1;
            } else {
                takenCargos[dealCargoId] += 1;
            }

            if (freeCountDb < takenCargos[dealCargoId]) {
                notValidCargos.push({
                    position: i,
                    type: ERRORS.DEALS.INVALID_CARGO_COUNT,
                });
            }
        }
        return acc;
    }, [[], {}]);
};

const validateDrivers = (body, driversFromDb) => {
    return body.reduce((notValidDrivers, item, i) => {
        const dealDriverId = item[HOMELESS_COLUMNS.DRIVER_ID_OR_DATA];
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
        const dealCarId = item[HOMELESS_COLUMNS.CAR_ID_OR_DATA];
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
        const dealTrailerId = item[HOMELESS_COLUMNS.TRAILER_ID_OR_DATA];
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

const validateShadowCars = (body, carsFromDb) => {
    return body.reduce((notValidCars, item, i) => {
        const dealCarId = item[HOMELESS_COLUMNS.CAR_ID_OR_DATA];
        if (!isValidUUID(dealCarId)) {
            const shadowStateNumber = dealCarId[HOMELESS_COLUMNS.CAR_STATE_NUMBER];
            const carFromDb = carsFromDb.find(car => car[HOMELESS_COLUMNS.CAR_STATE_NUMBER] === shadowStateNumber);
            if (carFromDb) {
                notValidCars.push({
                    position: i,
                    type: ERRORS.DEALS.CAR_STATE_NUMBER_EXISTS,
                });
            }
        }
        return notValidCars;
    }, []);
};

const validateShadowTrailers = (body, trailersFromDb) => {
    return body.reduce((notValidTrailers, item, i) => {
        const dealTrailerId = item[HOMELESS_COLUMNS.TRAILER_ID_OR_DATA];
        if (dealTrailerId && !isValidUUID(dealTrailerId)) {
            const shadowStateNumber = dealTrailerId[HOMELESS_COLUMNS.TRAILER_STATE_NUMBER];
            const trailerFromDb = trailersFromDb.find(trailer => trailer[HOMELESS_COLUMNS.TRAILER_STATE_NUMBER] === shadowStateNumber);
            if (trailerFromDb) {
                notValidTrailers.push({
                    position: i,
                    type: ERRORS.DEALS.TRAILER_STATE_NUMBER_EXISTS,
                });
            }
        }
        return notValidTrailers;
    }, []);
};

const validateCarsTrailers = (body, cars, trailers, cargoLoadingType) => {
    const arr = cargoLoadingType === LOADING_TYPES_MAP.LTL ? [body[0]] : [...body]; // for LTL we're able to check only first record
    return arr.reduce((errors, item, i) => {
        const carIdOrData = item[HOMELESS_COLUMNS.CAR_ID_OR_DATA];
        const trailerIdOrData = item[HOMELESS_COLUMNS.TRAILER_ID_OR_DATA];
        if (isValidUUID(carIdOrData)) {
            const carFromDb = cars.find(car => car.id === carIdOrData);
            const trailerIdWithCar = carFromDb[HOMELESS_COLUMNS.TRAILER_ID];
            if (trailerIdWithCar && trailerIdWithCar !== trailerIdOrData) {
                errors.push({
                    position: i,
                    type: ERRORS.DEALS.INVALID_CAR_WITH_TRAILER_JOIN,
                });
            }
        }
        if (isValidUUID(trailerIdOrData)) {
            const trailerFromDb = trailers.find(trailer => trailer.id === trailerIdOrData);
            const carIdWithTrailer = trailerFromDb[HOMELESS_COLUMNS.CAR_ID];
            if (carIdWithTrailer && carIdWithTrailer !== carIdOrData) {
                errors.push({
                    position: i,
                    type: ERRORS.DEALS.INVALID_CAR_WITH_TRAILER_JOIN,
                });
            }
        }
        return errors;
    },[]);
};

const extractData = body => body.reduce((acc, item) => {
    const [cargosIds, driversIds, driversData, carsIds, carsData, trailersIds, trailersData] = acc;
    const cargoId = item[HOMELESS_COLUMNS.CARGO_ID];
    const driverId = item[HOMELESS_COLUMNS.DRIVER_ID_OR_DATA];
    const carId = item[HOMELESS_COLUMNS.CAR_ID_OR_DATA];
    const trailerId = item[HOMELESS_COLUMNS.TRAILER_ID_OR_DATA];

    cargosIds.push(cargoId);
    if (isValidUUID(driverId)) {
        driversIds.push(driverId);
    } else {
        driversData.push(driverId);
    }
    if (isValidUUID(carId)) {
        carsIds.push(carId);
    } else {
        carsData.push(carId);
    }
    if (isValidUUID(trailerId)) {
        trailersIds.push(trailerId);
    } else if (trailerId) {
        trailersData.push(trailerId);
    }

    return [cargosIds, driversIds, driversData, carsIds, carsData, trailersIds, trailersData];
}, [[], [], [], [], [], [], []]);

const validateDealInstancesToConfirmedStatus = deal => {
    const dealsErrors = [];
    if (deal[HOMELESS_COLUMNS.CAR_SHADOW]) {
        dealsErrors.push(ERRORS.DEALS.SHADOW_CAR);
    }
    if (!deal[HOMELESS_COLUMNS.CAR_VERIFIED]) {
        dealsErrors.push(ERRORS.DEALS.NOT_VERIFIED_CAR);
    }
    if (deal[HOMELESS_COLUMNS.DRAFT_CAR_ID]) {
        dealsErrors.push(ERRORS.DEALS.CAR_IN_DRAFT);
    }

    if (deal[HOMELESS_COLUMNS.TRAILER_SHADOW]) {
        dealsErrors.push(ERRORS.DEALS.SHADOW_TRAILER);
    }
    if (!deal[HOMELESS_COLUMNS.TRAILER_VERIFIED]) {
        dealsErrors.push(ERRORS.DEALS.NOT_VERIFIED_TRAILER);
    }
    if (deal[HOMELESS_COLUMNS.DRAFT_TRAILER_ID]) {
        dealsErrors.push(ERRORS.DEALS.TRAILER_IN_DRAFT);
    }

    if (deal[HOMELESS_COLUMNS.DRIVER_SHADOW]) {
        dealsErrors.push(ERRORS.DEALS.SHADOW_DRIVER);
    }
    if (!deal[HOMELESS_COLUMNS.DRIVER_VERIFIED]) {
        dealsErrors.push(ERRORS.DEALS.NOT_VERIFIED_DRIVER);
    }
    if (deal[HOMELESS_COLUMNS.DRAFT_DRIVER_ID]) {
        dealsErrors.push(ERRORS.DEALS.DRIVER_IN_DRAFT);
    }

    return dealsErrors;
};

module.exports = {
    validateCargos,
    validateDrivers,
    validateCars,
    validateTrailers,
    validateShadowCars,
    validateShadowTrailers,
    validateCarsTrailers,
    extractData,
    validateDealInstancesToConfirmedStatus,
};
