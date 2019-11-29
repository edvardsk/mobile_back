const { success } = require('api/response');

// services
const TrailersServices = require('services/tables/trailers');

const removeTrailer = async (req, res, next) => {
    try {
        const { trailerId } = req.params;

        await TrailersServices.markAsDeleted(trailerId);

        return success(res, { trailerId });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    removeTrailer,
};
