// services
const DriversService = require('./drivers');
const CarsService = require('./cars');
const TrailersService = require('./trailers');

// constants
const { HOMELESS_COLUMNS } = require('constants/tables');
const { ERRORS } = require('constants/errors');

// helpers
const { isValidUUID } = require('helpers/validators');

const validateDealItems = async (arr, companyId) => {
    const availableDrivers = [];
    const availableCars = [];
    const availableTrailers = [];
    const invalidItems = await Promise.all(arr.map(async (item, i) => {
        const driverIdOrData = item[HOMELESS_COLUMNS.DRIVER_ID_OR_DATA];
        const carIdOrData = item[HOMELESS_COLUMNS.CAR_ID_OR_DATA];
        const trailerIdOrData = item[HOMELESS_COLUMNS.TRAILER_ID_OR_DATA];
        if (isValidUUID(driverIdOrData)) {
            const availableDriver = await DriversService.getAvailableDriverByIdAndCompanyId(driverIdOrData, companyId);
            if (!availableDriver) {
                return {
                    position: i,
                    type: ERRORS.DEALS.INVALID_DRIVER_ID,
                };
            } else {
                availableDrivers.push(availableDriver);
            }
        }
        if (isValidUUID(carIdOrData)) {
            const availableCar = await CarsService.getAvailableCarByIdAndCompanyId(carIdOrData, companyId);
            if (!availableCar) {
                return {
                    position: i,
                    type: ERRORS.DEALS.INVALID_CAR_ID,
                };
            } else {
                availableCars.push(availableCar);
            }
        }
        if (isValidUUID(trailerIdOrData)) {
            const availableTrailer = await TrailersService.getAvailableTrailerByIdAndCompanyId(trailerIdOrData, companyId);
            if (!availableTrailer) {
                return {
                    position: i,
                    type: ERRORS.DEALS.INVALID_TRAILER_ID,
                };
            } else {
                availableTrailers.push(availableTrailer);
            }
        }
    }));
    return [invalidItems.filter(Boolean), availableCars, availableTrailers, availableDrivers];
};

module.exports = {
    validateDealItems,
};
