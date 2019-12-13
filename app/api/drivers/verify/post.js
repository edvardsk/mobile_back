const { success, reject } = require('api/response');

// services
const DriversServices = require('services/tables/drivers');
const TablesServices = require('services/tables');

// constants
const { SQL_TABLES } = require('constants/tables');
const { ERRORS } = require('constants/errors');

// formatters
const DriversFormatters = require('formatters/drivers');

const colsDrivers = SQL_TABLES.CARS.COLUMNS;

const verifyDriver = async (req, res, next) => {
    try {
        const { driverId } = req.params;

        const driver = await DriversServices.getRecordStrict(driverId);
        if (driver[colsDrivers.VERIFIED]) {
            return reject(res, ERRORS.VERIFY.ALREADY_VERIFIED);
        }

        await TablesServices.runTransaction([
            DriversServices.editDriverAsTransaction(driverId, DriversFormatters.formatRecordAsVerified()),
        ]);

        return success(res, { driverId });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    verifyDriver,
};
