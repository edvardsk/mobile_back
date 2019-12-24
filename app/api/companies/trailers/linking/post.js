const { success } = require('api/response');

// services
const TrailersServices = require('services/tables/trailers');
const CarPointsService = require('services/tables/car-points');
const TableService = require('services/tables');

// constants
const { SUCCESS_CODES } = require('constants/http-codes');

const linkTrailerWithCar = async (req, res, next) => {
    try {
        const { trailerId } = req.params;
        const carId = req.body.car_id;
        const [ carPointstransactions, linkTrailerTransaction] = await Promise.all([
            CarPointsService.addPointOnLinking(carId, trailerId),
            TrailersServices.linkTrailerAndCar(trailerId, carId),
        ]);

        await TableService.runTransaction([... carPointstransactions, linkTrailerTransaction]);

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

const unlinkTrailerFromCar = async (req, res, next) => {
    try {
        const { trailerId } = req.params;

        const [ carPointstransactions, unlinkTrailerTransaction ] = await Promise.all([
            CarPointsService.addPointOnUnlinking(trailerId),
            TrailersServices.unlinkTrailerFromCar(trailerId),
        ]);

        await TableService.runTransaction([... carPointstransactions, unlinkTrailerTransaction]);

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    linkTrailerWithCar,
    unlinkTrailerFromCar,
};
