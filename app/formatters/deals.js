const uuid = require('uuid/v4');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { LOADING_TYPES_MAP } = require('constants/cargos');

// helpers
const { isValidUUID } = require('helpers/validators');

const colsDeals = SQL_TABLES.DEALS.COLUMNS;

const formatAllInstancesToSave = (arr, availableTrailers, cargoLoadingType, companyId) => {
    const generatedDriverId = uuid();
    const generatedCarId = uuid();
    const generatedTrailerId = uuid();

    return arr.reduce((acc, item, i) => {
        const [deals, newDrivers, newCars, newTrailers, editTrailers] = acc;
        const driverIdOrData = item[HOMELESS_COLUMNS.DRIVER_ID_OR_DATA];
        const carIdOrData = item[HOMELESS_COLUMNS.CAR_ID_OR_DATA];
        const trailerIdOrData = item[HOMELESS_COLUMNS.TRAILER_ID_OR_DATA];

        let driverId;
        let carId;
        let trailerId;
        if (cargoLoadingType === LOADING_TYPES_MAP.LTL) {
            driverId = isValidUUID(driverIdOrData) ? driverIdOrData : generatedDriverId;
            carId = isValidUUID(carIdOrData) ? carIdOrData : generatedCarId;
            trailerId = isValidUUID(trailerIdOrData) ? trailerIdOrData : generatedTrailerId;
        } else {
            driverId = isValidUUID(driverIdOrData) ? driverIdOrData : uuid();
            carId = isValidUUID(carIdOrData) ? carIdOrData : uuid();
            trailerId = isValidUUID(trailerIdOrData) ? trailerIdOrData : uuid();
        }

        if (!(cargoLoadingType === LOADING_TYPES_MAP.LTL && i > 0)) {
            if (!isValidUUID(driverIdOrData)) {
                newDrivers.push({
                    ...driverIdOrData,
                    [HOMELESS_COLUMNS.DRIVER_ID]: driverId,
                });
            }

            if (!isValidUUID(carIdOrData)) {
                newCars.push({
                    ...carIdOrData,
                    [HOMELESS_COLUMNS.CAR_ID]: carId,
                });
            }

            if (trailerIdOrData && !isValidUUID(trailerIdOrData)) {
                newTrailers.push({
                    ...trailerIdOrData,
                    [HOMELESS_COLUMNS.TRAILER_ID]: trailerId,
                    [HOMELESS_COLUMNS.CAR_ID]: carId,
                });
            } else if (trailerIdOrData && isValidUUID(trailerIdOrData)) {
                const trailerFromDb = availableTrailers.find(trailer => trailer.id === trailerIdOrData);
                if (trailerFromDb) {
                    const carIdWithTrailerFromDb = trailerFromDb[HOMELESS_COLUMNS.CAR_ID];
                    if (!carIdWithTrailerFromDb) {
                        editTrailers.push({
                            [HOMELESS_COLUMNS.TRAILER_ID]: trailerIdOrData,
                            [HOMELESS_COLUMNS.CAR_ID]: carId,
                        });
                    }
                }
            }
        }

        deals.push({
            [colsDeals.CARGO_ID]: item[HOMELESS_COLUMNS.CARGO_ID],
            [colsDeals.TRANSPORTER_COMPANY_ID]: companyId,
            [colsDeals.DRIVER_ID]: driverId,
            [colsDeals.CAR_ID]: carId,
            [colsDeals.TRAILER_ID]: trailerIdOrData ? trailerId : null,
            [colsDeals.PAY_CURRENCY_ID]: item[HOMELESS_COLUMNS.PAY_CURRENCY_ID],
            [colsDeals.PAY_VALUE]: item[HOMELESS_COLUMNS.PAY_VALUE],
        });

        return [deals, newDrivers, newCars, newTrailers, editTrailers];
    }, [[], [], [], [], []]);
};

module.exports = {
    formatAllInstancesToSave,
};
