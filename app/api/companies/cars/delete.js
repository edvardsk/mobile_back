const { success } = require('api/response');

// services
const CarsServices = require('services/tables/cars');

const removeCar = async (req, res, next) => {
    try {
        const { carId } = req.params;

        await CarsServices.markAsDeleted(carId);

        return success(res, { carId });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    removeCar,
};
