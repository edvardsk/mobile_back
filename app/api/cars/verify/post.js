const { success, reject } = require('api/response');

// services
const CarsServices = require('services/tables/cars');
const TablesServices = require('services/tables');

// constants
const { SQL_TABLES } = require('constants/tables');
const { ERRORS } = require('constants/errors');

// formatters
const CarsFormatters = require('formatters/cars');

const colsCars = SQL_TABLES.CARS.COLUMNS;

const verifyCar = async (req, res, next) => {
    try {
        const { carId } = req.params;

        const car = await CarsServices.getRecordStrict(carId);
        if (car[colsCars.VERIFIED]) {
            return reject(res, ERRORS.VERIFY.ALREADY_VERIFIED);
        }

        await TablesServices.runTransaction([
            CarsServices.editRecordAsTransaction(carId, CarsFormatters.formatRecordAsVerified()),
        ]);

        return success(res, { carId });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    verifyCar,
};
