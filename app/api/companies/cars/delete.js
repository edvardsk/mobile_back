const { success } = require('api/response');

// services
const CarsServices = require('services/tables/cars');
const TrailersServices = require('services/tables/trailers');
const TablesServices = require('services/tables');

const removeCar = async (req, res, next) => {
    try {
        const { carId } = req.params;

        await TablesServices.runTransaction([
            CarsServices.markAsDeletedAsTransaction(carId),
            TrailersServices.unlinkTrailerFromCarByCarIdAsTransaction(carId),
        ]);

        return success(res, { carId });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    removeCar,
};
