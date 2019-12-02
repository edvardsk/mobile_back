const { success } = require('api/response');

// services
const TrailersServices = require('services/tables/trailers');

// constants
const { SUCCESS_CODES } = require('constants/http-codes');

const linkTrailerWithCar = async (req, res, next) => {
    try {
        const { trailerId } = req.params;
        const carId = req.body.car_id;

        await TrailersServices.linkTrailerAndCar(trailerId, carId);

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

const unlinkTrailerFromCar = async (req, res, next) => {
    try {
        const { trailerId } = req.params;

        await TrailersServices.unlinkTrailerFromCar(trailerId);

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    linkTrailerWithCar,
    unlinkTrailerFromCar,
};
